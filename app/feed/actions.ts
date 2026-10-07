'use server'

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
    return { ok: false, message: 'Please log in to vote.' }
  }

  // Each vote is a brand-new row (no update/upsert).
  const { error } = await supabase
    .from('caption_votes')
    .insert({ user_id: user.id, caption_id: captionId, vote })

  if (error) {
    if (error.code === '23505') {
      return { ok: false, message: 'You have already voted on this caption.' }
    }
    if (error.code === '42501') {
      return {
        ok: false,
        message: 'Vote rejected by database permissions (row-level security).',
      }
    }
    if (error.code === '23503') {
      return { ok: false, message: 'That caption no longer exists.' }
    }
    return { ok: false, message: `Could not save your vote: ${error.message}` }
  }

  return {
    ok: true,
    message: vote === 1 ? 'Upvote recorded!' : 'Downvote recorded!',
  }
}
