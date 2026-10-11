'use client'

import Link from 'next/link'
import { useRef, useState, useTransition } from 'react'
import { submitVote, type VoteValue } from '@/app/feed/actions'
import type { Meme } from '@/lib/memes'
import MemeImage from '@/components/MemeImage'
import Spinner from '@/components/Spinner'
import { AlertIcon, ExternalLinkIcon, LaughIcon, MehIcon, SparkleIcon } from '@/components/icons'

type Props = {
  meme: Meme
  signedIn: boolean
  currentVote: VoteValue | null
  onVoted: (captionId: number, vote: VoteValue) => void
  priority?: boolean
  className?: string
}

const VERDICTS: { value: VoteValue; label: string; Icon: typeof LaughIcon; selected: string }[] = [
  { value: 1, label: 'Funny', Icon: LaughIcon, selected: 'border-zest bg-zest text-zest-ink' },
  { value: -1, label: 'Not funny', Icon: MehIcon, selected: 'border-foreground bg-foreground text-background' },
]

export function MemeSource({ meme }: { meme: Meme }) {
  return meme.isAi ? (
    <p className="flex min-w-0 items-center gap-2 text-xs text-muted">
      <span className="chip shrink-0 border-transparent bg-zest py-0.5 font-semibold text-zest-ink">
        <SparkleIcon className="h-3.5 w-3.5" /> AI-written
      </span>
      {meme.prompt && (
        <span className="truncate">
          <span className="sr-only">Topic: </span>on “{meme.prompt}”
        </span>
      )}
    </p>
  ) : (
    <p className="text-xs">
      <span className="chip py-0.5 font-semibold text-muted">Original</span>
    </p>
  )
}

export default function MemeCard({ meme, signedIn, currentVote, onVoted, priority = false, className = '' }: Props) {
  const [, startTransition] = useTransition()
  const [pendingVote, setPendingVote] = useState<VoteValue | null>(null)
  const [justVoted, setJustVoted] = useState(false)
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null)
  // Guards against double clicks that land before React re-renders the disabled state.
  const inFlight = useRef(false)

  const saving = pendingVote !== null
  const headingId = `meme-${meme.id}`

  function vote(value: VoteValue) {
    // Re-tapping your current verdict would only append an identical vote row.
    if (inFlight.current || value === currentVote) return
    inFlight.current = true
    setPendingVote(value)
    setStatus(null)
    setJustVoted(false)
    startTransition(async () => {
      try {
        const res = await submitVote(meme.id, value)
        if (res.ok) {
          onVoted(meme.id, value)
          setJustVoted(true)
        }
        setStatus(res)
      } catch {
        setStatus({ ok: false, message: 'Couldn’t save that. Check your connection and try again.' })
      } finally {
        inFlight.current = false
        setPendingVote(null)
      }
    })
  }

  return (
    <li className={`card meme-card overflow-hidden p-0 ${className}`} aria-labelledby={headingId}>
      <figure>
        <div className="px-5 pt-4 sm:px-6">
          <MemeSource meme={meme} />
        </div>
        <figcaption
          id={headingId}
          className="px-5 pt-2.5 pb-4 font-display text-[1.375rem] leading-[1.2] font-bold tracking-[-0.02em] text-pretty sm:px-6 sm:text-2xl"
        >
          {meme.text}
        </figcaption>
        <MemeImage src={meme.imageUrl} alt={meme.imageAlt} caption={meme.text} priority={priority} />
      </figure>

      <div className="p-3 sm:p-4">
        <div role="group" aria-label="Your verdict" className="flex gap-2">
          {VERDICTS.map(({ value, label, Icon, selected }) => {
            const isPending = pendingVote === value
            const isSelected = currentVote === value && !saving
            const content = (
              <>
                {isPending ? <Spinner className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                {label}
              </>
            )
            return signedIn ? (
              <button
                key={value}
                type="button"
                onClick={() => vote(value)}
                disabled={saving}
                aria-pressed={isSelected}
                aria-busy={isPending}
                className={`btn btn-vote ${
                  isSelected ? `${selected} ${justVoted ? 'animate-pop' : ''}` : 'hover:border-foreground/30 hover:bg-surface-2'
                }`}
              >
                {content}
              </button>
            ) : (
              <Link key={value} href="/login" className="btn btn-vote hover:border-foreground/30 hover:bg-surface-2">
                {content}
              </Link>
            )
          })}
        </div>

        {/* Success is visible on the buttons themselves; it's only announced for screen readers. */}
        <div aria-live="polite">
          {status &&
            (status.ok ? (
              <span className="sr-only">{status.message}</span>
            ) : (
              <p role="alert" className="mt-2.5 flex items-start gap-1.5 px-1 text-[0.8rem] text-red-700 dark:text-red-400">
                <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                {status.message}
              </p>
            ))}
        </div>
      </div>

      {meme.imageCredit && (
        <p className="border-t border-border px-5 py-2.5 text-[0.7rem] leading-relaxed text-muted sm:px-6">
          Photo:{' '}
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
