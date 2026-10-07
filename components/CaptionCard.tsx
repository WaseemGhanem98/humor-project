'use client'

import { useRef, useState, useTransition } from 'react'
import { submitVote, type VoteResult, type VoteValue } from '@/app/captions/actions'
import type { Meme } from '@/lib/memes'
import MemeImage from '@/components/MemeImage'
import Spinner from '@/components/Spinner'
import { AlertIcon, CheckIcon, ExternalLinkIcon, ThumbDownIcon, ThumbUpIcon } from '@/components/icons'

type Props = {
  meme: Meme
  signedIn: boolean
  priority?: boolean
}

const VOTE_STYLES: Record<VoteValue, { idle: string; saved: string }> = {
  1: {
    idle: 'hover:border-green-500/60 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950/40 dark:hover:text-green-300',
    saved: 'border-green-500 bg-green-500 text-white shadow-sm shadow-green-500/30 dark:bg-green-600',
  },
  [-1]: {
    idle: 'hover:border-red-500/60 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300',
    saved: 'border-red-500 bg-red-500 text-white shadow-sm shadow-red-500/30 dark:bg-red-600',
  },
}

export default function CaptionCard({ meme, signedIn, priority = false }: Props) {
  const [, startTransition] = useTransition()
  const [pendingVote, setPendingVote] = useState<VoteValue | null>(null)
  const [lastSaved, setLastSaved] = useState<VoteValue | null>(null)
  const [result, setResult] = useState<VoteResult | null>(null)
  // Guards against double clicks that land before React re-renders the disabled state.
  const inFlight = useRef(false)

  const saving = pendingVote !== null
  const headingId = `caption-${meme.id}`

  function vote(value: VoteValue) {
    if (!signedIn || inFlight.current) return
    inFlight.current = true
    setPendingVote(value)
    setResult(null)
    startTransition(async () => {
      try {
        const res = await submitVote(meme.id, value)
        setResult(res)
        setLastSaved(res.ok ? value : null)
      } catch {
        setResult({ ok: false, message: 'Something went wrong. Check your connection and try again.' })
        setLastSaved(null)
      } finally {
        inFlight.current = false
        setPendingVote(null)
      }
    })
  }

  function renderVoteButton(value: VoteValue, label: string) {
    const Icon = value === 1 ? ThumbUpIcon : ThumbDownIcon
    const isPending = pendingVote === value
    const isSaved = lastSaved === value && !saving
    const styles = VOTE_STYLES[value]
    return (
      <button
        type="button"
        onClick={() => vote(value)}
        disabled={!signedIn || saving}
        aria-busy={isPending}
        aria-pressed={isSaved}
        className={`btn btn-secondary btn-vote flex-1 sm:flex-none ${
          isSaved ? styles.saved : signedIn ? styles.idle : ''
        }`}
      >
        {isPending ? <Spinner /> : <Icon className="h-[1.125rem] w-[1.125rem]" />}
        {isPending ? 'Saving…' : label}
      </button>
    )
  }

  return (
    <li className="card meme-card overflow-hidden p-0" aria-labelledby={headingId}>
      <figure>
        <figcaption
          id={headingId}
          className="px-5 pt-5 pb-4 text-xl leading-snug font-semibold tracking-tight text-pretty sm:px-6 sm:text-2xl"
        >
          {meme.text}
        </figcaption>
        <MemeImage src={meme.imageUrl} alt={meme.imageAlt} caption={meme.text} priority={priority} />
      </figure>

      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
        <div role="group" aria-label="Rate this meme" className="flex gap-2">
          {renderVoteButton(1, 'Funny')}
          {renderVoteButton(-1, 'Not funny')}
        </div>

        <div aria-live="polite" className="min-h-5 text-sm sm:ml-auto sm:text-right">
          {!signedIn ? (
            <span className="text-muted">Sign in to vote</span>
          ) : result ? (
            <span
              role={result.ok ? 'status' : 'alert'}
              className={`inline-flex items-start gap-1.5 ${
                result.ok ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
              }`}
            >
              {result.ok ? (
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              {result.message}
            </span>
          ) : saving ? (
            <span className="text-muted">Saving your vote…</span>
          ) : null}
        </div>
      </div>

      {meme.imageCredit && (
        <p className="border-t border-border px-5 py-2.5 text-xs text-muted sm:px-6">
          Image:{' '}
          {meme.imageSourceUrl ? (
            <a
              href={meme.imageSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded underline-offset-2 hover:text-foreground hover:underline"
            >
              {meme.imageCredit}
              <ExternalLinkIcon className="ml-1 inline-block h-3 w-3 align-[-0.125em]" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          ) : (
            meme.imageCredit
          )}
        </p>
      )}
    </li>
  )
}
