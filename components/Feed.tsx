'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { VoteValue } from '@/app/feed/actions'
import type { Meme } from '@/lib/memes'
import MemeCard from '@/components/MemeCard'
import { ArrowRightIcon, CheckIcon } from '@/components/icons'

type Props = {
  memes: Meme[]
  signedIn: boolean
  initialVotes: Record<number, VoteValue>
}

export default function Feed({ memes, signedIn, initialVotes }: Props) {
  const [votes, setVotes] = useState(initialVotes)
  const rated = memes.filter((m) => votes[m.id]).length
  const allRated = rated === memes.length

  function handleVoted(captionId: number, vote: VoteValue) {
    setVotes((prev) => ({ ...prev, [captionId]: vote }))
  }

  return (
    <>
      {signedIn && (
        <div className="sticky top-16 z-20 -mx-4 mb-5 bg-background/85 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">
              {allRated ? 'All caught up' : `${rated} of ${memes.length} rated`}
            </span>
            <Link href="/profile" className="rounded font-medium text-muted hover:text-foreground">
              Your takes
            </Link>
          </div>
          <div
            role="progressbar"
            aria-label="Memes rated"
            aria-valuemin={0}
            aria-valuemax={memes.length}
            aria-valuenow={rated}
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-foreground/10"
          >
            <div
              className="h-full rounded-full bg-zest transition-[width] duration-500 motion-reduce:transition-none dark:bg-zest"
              style={{ width: `${(rated / memes.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      <ul className="space-y-6 sm:space-y-8">
        {memes.map((meme, index) => (
          <MemeCard
            key={meme.id}
            meme={meme}
            signedIn={signedIn}
            currentVote={votes[meme.id] ?? null}
            onVoted={handleVoted}
            priority={index === 0}
          />
        ))}
      </ul>

      <div className="mt-8 rounded-3xl border border-dashed border-border px-6 py-10 text-center">
        {signedIn ? (
          <>
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-zest text-zest-ink">
              <CheckIcon className="h-5 w-5" />
            </span>
            <p className="display mt-4 text-xl">{allRated ? 'You’re all caught up.' : 'That’s the whole feed.'}</p>
            <p className="mt-1 text-sm text-muted">
              {allRated ? 'New memes land here first.' : `${memes.length - rated} still waiting on your verdict.`}
            </p>
            <Link href="/profile" className="btn btn-secondary mt-5">
              See your takes
            </Link>
          </>
        ) : (
          <>
            <p className="display text-xl">Got opinions?</p>
            <p className="mt-1 text-sm text-muted">Sign in to call each one funny or not.</p>
            <Link href="/login" className="btn btn-primary mt-5">
              Sign in to vote <ArrowRightIcon />
            </Link>
          </>
        )}
      </div>
    </>
  )
}
