'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type VoteValue = 1 | -1

export type VoteResult = { ok: boolean; message: string }

export async function submitVote(
  captionId: number,
  vote: VoteValue
): Promise<VoteResult> {
  if (!Number.isInteger(captionId) || (vote !== 1 && vote !== -1)) {
    return { ok: false, message: 'Invalid vote.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Never trust the UI: re-check the session on the server before inserting.
  if (!user) {
    return { ok: false, message: 'Your session ended. Sign in again to vote.' }
  }

  // Each vote is a brand-new row (no update/upsert).
  const { error } = await supabase
    .from('caption_votes')
    .insert({ user_id: user.id, caption_id: captionId, vote })

  if (error) {
    if (error.code === '23505') {
      return { ok: false, message: 'You’ve already voted on this one.' }
    }
    if (error.code === '42501') {
      return { ok: false, message: 'That vote wasn’t allowed. Try signing out and back in.' }
    }
    if (error.code === '23503') {
      return { ok: false, message: 'That meme no longer exists.' }
    }
    // Details stay in the server log; never show raw database errors.
    console.error('submitVote failed:', error.code, error.message)
    return { ok: false, message: 'Couldn’t save that vote. Try again.' }
  }

  // Drop cached copies of pages that show your votes (e.g. the feed when you hit Back).
  revalidatePath('/feed')
  revalidatePath('/profile')

  return {
    ok: true,
    message: vote === 1 ? 'Saved: Funny.' : 'Saved: Not funny.',
  }
}
