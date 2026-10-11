'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { VoteValue } from '@/app/feed/actions'
import type { Meme } from '@/lib/memes'
import MemeCard from '@/components/MemeCard'
import { ArrowRightIcon, SparkleIcon } from '@/components/icons'

type Props = {
  memes: Meme[]
  signedIn: boolean
  initialVotes: Record<number, VoteValue>
}

export default function Feed({ memes, signedIn, initialVotes }: Props) {
  const [votes, setVotes] = useState(initialVotes)
  // Unjudged memes first, newest first within each group. Computed once from the server's
  // view so cards don't jump around while you vote.
  const [{ fresh, judged }] = useState(() => ({
    fresh: memes.filter((m) => !initialVotes[m.id]),
    judged: memes.filter((m) => initialVotes[m.id]),
  }))
  const rated = memes.filter((m) => votes[m.id]).length
  const allRated = rated === memes.length

  function handleVoted(captionId: number, vote: VoteValue) {
    setVotes((prev) => ({ ...prev, [captionId]: vote }))
  }

  const card = (meme: Meme, index: number) => (
    <MemeCard
      key={meme.id}
      meme={meme}
      signedIn={signedIn}
      currentVote={votes[meme.id] ?? null}
      onVoted={handleVoted}
      priority={index === 0}
    />
  )

  const list = (items: Meme[], offset = 0) => (
    <ul className="space-y-10 sm:space-y-14">{items.map((m, i) => card(m, offset + i))}</ul>
  )

  return (
    <>
      {signedIn && (
        <div className="sticky top-16 z-20 -mx-4 mb-8 border-b border-rule bg-background/95 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4">
            <span className="meta tabular-nums">
              {allRated ? 'All caught up' : `${String(rated).padStart(2, '0')} / ${String(memes.length).padStart(2, '0')} judged`}
            </span>
            <Link href="/profile" className="meta text-muted hover:text-foreground">
              Your takes →
            </Link>
          </div>
          <div
            role="progressbar"
            aria-label="Memes judged"
            aria-valuemin={0}
            aria-valuemax={memes.length}
            aria-valuenow={rated}
            className="mt-2.5 h-[3px] bg-foreground/10"
          >
            <div
              className="h-full bg-foreground transition-[width] duration-500 motion-reduce:transition-none"
              style={{ width: `${(rated / memes.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {!signedIn || fresh.length === 0 ? (
        list(signedIn ? judged : memes)
      ) : (
        <>
          {list(fresh)}
          {judged.length > 0 && (
            <>
              <h2 className="eyebrow mt-16 mb-6 flex items-center gap-4">
                <span aria-hidden className="h-px flex-1 bg-rule" />
                Already judged
                <span aria-hidden className="h-px flex-1 bg-rule" />
              </h2>
              {list(judged, fresh.length)}
            </>
          )}
        </>
      )}

      <div className="mt-16 border-t-[3px] border-double border-rule pt-10 text-center">
        {signedIn ? (
          <>
            <p className="eyebrow">{allRated ? 'End of the feed' : `${memes.length - rated} still waiting on you`}</p>
            <p className="display mt-3 text-4xl">{allRated ? 'You’re all caught up.' : 'That’s the whole feed.'}</p>
            <p className="mt-2 text-muted">Fresh ones land every day. Or make the next one.</p>
            <Link href="/create" className="btn btn-primary btn-lg mt-6">
              <SparkleIcon /> Make one
            </Link>
          </>
        ) : (
          <>
            <p className="eyebrow">End of the feed</p>
            <p className="display mt-3 text-4xl">Got opinions?</p>
            <p className="mt-2 text-muted">Sign in to judge these and make your own.</p>
            <Link href="/login" className="btn btn-primary btn-lg mt-6">
              Sign in <ArrowRightIcon />
            </Link>
          </>
        )}
      </div>
    </>
  )
}
