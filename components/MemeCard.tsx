'use client'

import Link from 'next/link'
import { useRef, useState, useTransition } from 'react'
import { submitVote, type VoteValue } from '@/app/feed/actions'
import type { Meme } from '@/lib/memes'
import MemeImage from '@/components/MemeImage'
import Spinner from '@/components/Spinner'
import { MemeSource, plateNumber } from '@/components/MemeSource'
import { AlertIcon, ExternalLinkIcon, LaughIcon, MehIcon } from '@/components/icons'

type Props = {
  meme: Meme
  signedIn: boolean
  currentVote: VoteValue | null
  onVoted: (captionId: number, vote: VoteValue) => void
  priority?: boolean
  className?: string
}

const VERDICTS: { value: VoteValue; label: string; Icon: typeof LaughIcon; selected: string }[] = [
  { value: 1, label: 'Funny', Icon: LaughIcon, selected: 'bg-zest text-zest-ink' },
  { value: -1, label: 'Not funny', Icon: MehIcon, selected: 'bg-foreground text-background' },
]

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
    <li className={`plate ${className}`} aria-labelledby={headingId}>
      <figure>
        <div className="flex items-center justify-between gap-3 border-b border-rule px-4 py-2.5">
          <span className="meta text-muted">{plateNumber(meme.id)}</span>
          <MemeSource meme={meme} />
        </div>
        <MemeImage src={meme.imageUrl} alt={meme.imageAlt} caption={meme.text} priority={priority} />
        <div className="border-t border-rule px-5 pt-5 pb-6 sm:px-7 sm:pt-6 sm:pb-7">
          <figcaption id={headingId} className="display text-[1.85rem] leading-[1.08] text-pretty sm:text-[2.35rem]">
            {meme.text}
          </figcaption>
          {meme.isAi && meme.prompt && (
            <p className="mt-3 truncate text-sm text-muted">
              <span className="sr-only">Topic: </span>
              <span aria-hidden className="meta mr-2">Prompt</span>“<bdi>{meme.prompt}</bdi>”
            </p>
          )}
        </div>
      </figure>

      <div role="group" aria-label="Your verdict" className="grid grid-cols-2 border-t border-rule">
        {VERDICTS.map(({ value, label, Icon, selected }, i) => {
          const isPending = pendingVote === value
          const isSelected = currentVote === value && !saving
          const cls = `flex h-14 touch-manipulation items-center justify-center gap-2 text-[0.95rem] font-semibold transition-colors select-none sm:h-16 ${
            i === 0 ? 'border-r border-rule' : ''
          }`
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
              className={`${cls} disabled:cursor-wait ${isSelected ? `${selected} ${justVoted ? 'animate-pop' : ''}` : 'hover:bg-surface-2'}`}
            >
              {content}
            </button>
          ) : (
            <Link key={value} href="/login" className={`${cls} hover:bg-surface-2`}>
              {content}
            </Link>
          )
        })}
      </div>

      {/* Success shows on the verdict bar itself; it's only announced for screen readers. */}
      <div aria-live="polite">
        {status &&
          (status.ok ? (
            <span className="sr-only">{status.message}</span>
          ) : (
            <p role="alert" className="flex items-start gap-1.5 border-t border-rule bg-danger/[0.07] px-4 py-2.5 text-[0.8rem]">
              <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
              {status.message}
            </p>
          ))}
      </div>

      {meme.imageCredit && (
        <p className="border-t border-border px-4 py-2 text-[0.68rem] leading-relaxed text-muted">
          Photo:{' '}
          {meme.imageSourceUrl ? (
            <a href={meme.imageSourceUrl} target="_blank" rel="noopener noreferrer" className="rounded-[2px] hover:text-foreground hover:underline">
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
