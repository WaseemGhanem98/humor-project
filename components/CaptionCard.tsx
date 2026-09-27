'use client'

import { useRef, useState, useTransition } from 'react'
import { submitVote, type VoteResult, type VoteValue } from '@/app/captions/actions'
import Spinner from '@/components/Spinner'
import { AlertIcon, CheckIcon, ThumbDownIcon, ThumbUpIcon } from '@/components/icons'

type Props = {
  caption: { id: number; text: string }
  signedIn: boolean
}

const VOTE_STYLES: Record<VoteValue, { idle: string; saved: string }> = {
  1: {
    idle: 'hover:border-green-500 hover:bg-green-50 hover:text-green-800 dark:hover:bg-green-950/50 dark:hover:text-green-300',
    saved: 'border-green-500 bg-green-50 text-green-800 dark:bg-green-950/50 dark:text-green-300',
  },
  [-1]: {
    idle: 'hover:border-red-500 hover:bg-red-50 hover:text-red-800 dark:hover:bg-red-950/50 dark:hover:text-red-300',
    saved: 'border-red-500 bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300',
  },
}

export default function CaptionCard({ caption, signedIn }: Props) {
  const [, startTransition] = useTransition()
  const [pendingVote, setPendingVote] = useState<VoteValue | null>(null)
  const [lastSaved, setLastSaved] = useState<VoteValue | null>(null)
  const [result, setResult] = useState<VoteResult | null>(null)
  // Guards against double clicks that land before React re-renders the disabled state.
  const inFlight = useRef(false)

  const saving = pendingVote !== null
  const headingId = `caption-${caption.id}`

  function vote(value: VoteValue) {
    if (!signedIn || inFlight.current) return
    inFlight.current = true
    setPendingVote(value)
    setResult(null)
    startTransition(async () => {
      try {
        const res = await submitVote(caption.id, value)
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
    const styles = VOTE_STYLES[value]
    return (
      <button
        type="button"
        onClick={() => vote(value)}
        disabled={!signedIn || saving}
        aria-busy={isPending}
        className={`btn btn-secondary flex-1 sm:flex-none ${
          lastSaved === value && !saving ? styles.saved : signedIn ? styles.idle : ''
        }`}
      >
        {isPending ? <Spinner /> : <Icon />}
        {isPending ? 'Saving…' : label}
      </button>
    )
  }

  return (
    <li className="card flex flex-col gap-5" aria-labelledby={headingId}>
      <blockquote id={headingId} className="text-lg leading-relaxed font-medium text-pretty sm:text-xl">
        <span aria-hidden className="mr-0.5 text-accent">“</span>
        {caption.text}
        <span aria-hidden className="ml-0.5 text-accent">”</span>
      </blockquote>

      <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center">
        <div role="group" aria-label="Rate this caption" className="flex gap-2">
          {renderVoteButton(1, 'Upvote')}
          {renderVoteButton(-1, 'Downvote')}
        </div>

        <div aria-live="polite" className="min-h-5 text-sm sm:ml-auto">
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
    </li>
  )
}
