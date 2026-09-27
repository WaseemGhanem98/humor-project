'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { submitVote, type VoteResult, type VoteValue } from '@/app/captions/actions'

type Props = {
  caption: { id: number; text: string }
  signedIn: boolean
}

export default function CaptionCard({ caption, signedIn }: Props) {
  const [pending, startTransition] = useTransition()
  const [pendingVote, setPendingVote] = useState<VoteValue | null>(null)
  const [result, setResult] = useState<VoteResult | null>(null)

  function vote(value: VoteValue) {
    setPendingVote(value)
    setResult(null)
    startTransition(async () => {
      setResult(await submitVote(caption.id, value))
      setPendingVote(null)
    })
  }

  return (
    <li className="card flex flex-col gap-4">
      <p className="text-lg leading-relaxed">“{caption.text}”</p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => vote(1)}
          disabled={!signedIn || pending}
          aria-label="Upvote"
          className="btn btn-secondary hover:border-green-500 hover:text-green-700 dark:hover:text-green-400"
        >
          👍 {pendingVote === 1 ? 'Voting…' : 'Upvote'}
        </button>
        <button
          type="button"
          onClick={() => vote(-1)}
          disabled={!signedIn || pending}
          aria-label="Downvote"
          className="btn btn-secondary hover:border-red-500 hover:text-red-700 dark:hover:text-red-400"
        >
          👎 {pendingVote === -1 ? 'Voting…' : 'Downvote'}
        </button>

        {!signedIn && (
          <Link href="/login" className="text-sm font-medium text-accent hover:underline">
            Log in to vote
          </Link>
        )}
      </div>

      {result && (
        <p
          role={result.ok ? 'status' : 'alert'}
          className={`alert ${result.ok ? 'alert-success' : 'alert-error'}`}
        >
          {result.message}
        </p>
      )}
    </li>
  )
}
