'use client'

import Link from 'next/link'
import { useRef, useState, useTransition } from 'react'
import { submitVote, type VoteValue } from '@/app/feed/actions'
import type { Meme } from '@/lib/memes'
import MemeImage from '@/components/MemeImage'
import Spinner from '@/components/Spinner'
import { AlertIcon, CheckIcon, ExternalLinkIcon, LaughIcon, MehIcon } from '@/components/icons'

type Props = {
  meme: Meme
  signedIn: boolean
  currentVote: VoteValue | null
  onVoted: (captionId: number, vote: VoteValue) => void
  priority?: boolean
}

const VERDICTS: { value: VoteValue; label: string; Icon: typeof LaughIcon; selected: string }[] = [
  { value: 1, label: 'Funny', Icon: LaughIcon, selected: 'border-zest bg-zest text-zest-ink' },
  { value: -1, label: 'Not funny', Icon: MehIcon, selected: 'border-foreground bg-foreground text-background' },
]

export default function MemeCard({ meme, signedIn, currentVote, onVoted, priority = false }: Props) {
  const [, startTransition] = useTransition()
  const [pendingVote, setPendingVote] = useState<VoteValue | null>(null)
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
    startTransition(async () => {
      try {
        const res = await submitVote(meme.id, value)
        if (res.ok) {
          onVoted(meme.id, value)
          setStatus({ ok: true, message: res.message })
        } else {
          setStatus({ ok: false, message: res.message })
        }
      } catch {
        setStatus({ ok: false, message: 'Something went wrong. Check your connection and try again.' })
      } finally {
        inFlight.current = false
        setPendingVote(null)
      }
    })
  }

  return (
    <li className="card meme-card overflow-hidden p-0" aria-labelledby={headingId}>
      <figure>
        <figcaption
          id={headingId}
          className="px-5 pt-5 pb-4 font-display text-[1.375rem] leading-[1.2] font-bold tracking-[-0.02em] text-pretty sm:px-6 sm:text-2xl"
        >
          {meme.text}
        </figcaption>
        <MemeImage src={meme.imageUrl} alt={meme.imageAlt} caption={meme.text} priority={priority} />
      </figure>

      <div className={`px-4 pt-4 sm:px-5 ${signedIn ? 'pb-3' : 'pb-4'}`}>
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
                className={`btn btn-vote ${isSelected ? selected : 'hover:border-foreground/30 hover:bg-surface-2'}`}
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

        {signedIn && (
          <div aria-live="polite" className="mt-2.5 min-h-5 px-1 text-[0.8rem]">
            {saving ? (
              <span className="text-muted">Saving…</span>
            ) : status ? (
              <span
                role={status.ok ? 'status' : 'alert'}
                className={`inline-flex items-start gap-1.5 ${status.ok ? 'text-foreground' : 'text-red-700 dark:text-red-400'}`}
              >
                {status.ok ? <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />}
                {status.message}
              </span>
            ) : null}
          </div>
        )}
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
