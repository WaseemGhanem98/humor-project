import type { MyVote } from '@/lib/votes'

// Per-user stats from current verdicts (one per meme, the latest vote: see fetchMyVotes).
// Switching a verdict moves a meme between funny/notFunny; `rated` never double-counts.
export function verdictStats(votes: MyVote[], memeIds: Set<number>) {
  const current = votes.filter((v) => memeIds.has(v.captionId))
  const funny = current.filter((v) => v.vote === 1).length
  const rated = current.length
  const total = memeIds.size
  return {
    rated,
    funny,
    notFunny: rated - funny,
    funnyPct: rated ? Math.round((funny / rated) * 100) : null,
    total,
    remaining: Math.max(total - rated, 0),
    current,
  }
}
