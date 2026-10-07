import type { createClient } from '@/lib/supabase/server'
import type { VoteValue } from '@/app/feed/actions'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

export type MyVote = { captionId: number; vote: VoteValue; votedAt: string }

// Votes are append-only (every click is a new row), so a user's current take on a
// meme is their most recent row for it. Needs the "read own votes" policy in
// supabase/vote_history.sql; without it RLS simply returns no rows.
export async function fetchMyVotes(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('caption_votes')
    .select('caption_id, vote, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })

  const latest = new Map<number, MyVote>()
  for (const row of data ?? []) {
    if (!latest.has(row.caption_id) && (row.vote === 1 || row.vote === -1)) {
      latest.set(row.caption_id, { captionId: row.caption_id, vote: row.vote, votedAt: row.created_at })
    }
  }
  return { votes: [...latest.values()], error }
}
