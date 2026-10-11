'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, useTransition } from 'react'
import { createMeme } from '@/app/create/actions'
import type { VoteValue } from '@/app/feed/actions'
import type { Meme } from '@/lib/memes'
import MemeCard from '@/components/MemeCard'
import { AlertIcon, ArrowRightIcon, CheckIcon, RefreshIcon, SparkleIcon } from '@/components/icons'

const SUGGESTIONS = ['Monday standups', 'Group chats at 2am', 'Reply-all emails', 'Gym in January', 'Finals week']
const WRITING_STEPS = ['Reading the room…', 'Drafting the joke…', 'Picking the photo…', 'Running it past the filter…']

type Props = { topicMin: number; topicMax: number; dailyLimit: number; initialLeft: number }

// Shown while the model works: a meme-shaped placeholder with short, honest status lines.
function Writing({ topic }: { topic: string }) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, WRITING_STEPS.length - 1)), 1500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="card animate-fade overflow-hidden p-0" aria-busy="true">
      <div className="space-y-3 px-5 pt-4 pb-4 sm:px-6">
        <p className="flex items-center gap-2 text-xs text-muted">
          <span className="chip border-transparent bg-zest py-0.5 font-semibold text-zest-ink">
            <SparkleIcon className="h-3.5 w-3.5 animate-pulse motion-reduce:animate-none" /> AI-written
          </span>
          <span className="truncate">on “{topic}”</span>
        </p>
        <div className="skeleton h-6 w-11/12" />
        <div className="skeleton h-6 w-2/3" />
      </div>
      <div className="skeleton aspect-[4/3] w-full rounded-none" />
      <p role="status" className="flex items-center gap-2 px-5 py-4 text-sm font-medium sm:px-6">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-zest opacity-75 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-zest" />
        </span>
        {WRITING_STEPS[step]}
      </p>
    </div>
  )
}

export default function CreateMeme({ topicMin, topicMax, dailyLimit, initialLeft }: Props) {
  const [topic, setTopic] = useState('')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [meme, setMeme] = useState<Meme | null>(null)
  const [vote, setVote] = useState<VoteValue | null>(null)
  const [left, setLeft] = useState(initialLeft)
  const inputRef = useRef<HTMLInputElement>(null)
  // Blocks a second submit that lands before React re-renders (double click, Enter + click).
  const inFlight = useRef(false)
  const resultRef = useRef<HTMLHeadingElement>(null)

  const trimmed = topic.trim()
  const outOfMemes = left <= 0

  // Move focus to what changed: the result, or back to the input when there's an error
  // (the form only remounts once the transition ends, hence the effect).
  useEffect(() => {
    if (meme) resultRef.current?.focus()
  }, [meme])
  useEffect(() => {
    if (error && !pending) inputRef.current?.focus()
  }, [error, pending])

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (inFlight.current || outOfMemes || trimmed.length < topicMin) return
    inFlight.current = true
    setError(null)
    startTransition(async () => {
      try {
        const res = await createMeme(trimmed)
        if (typeof res.left === 'number') setLeft(res.left)
        if (res.ok) {
          setMeme(res.meme)
          setVote(null)
        } else {
          setError(res.message)
        }
      } catch {
        setError('Couldn’t reach Wry. Check your connection and try again.')
      } finally {
        inFlight.current = false
      }
    })
  }

  function again() {
    setMeme(null)
    setTopic('')
    setError(null)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  if (meme) {
    return (
      <section aria-labelledby="result-heading">
        <h2 id="result-heading" ref={resultRef} tabIndex={-1} className="display mb-1 text-2xl outline-none">
          Fresh one. Is it funny?
        </h2>
        <p className="mb-5 text-sm text-muted">It’s live in the feed. Judge it yourself first.</p>
        <ul>
          <MemeCard
            meme={meme}
            signedIn
            currentVote={vote}
            onVoted={(_, v) => setVote(v)}
            priority
            className="animate-rise"
          />
        </ul>
        {vote && (
          <p className="animate-fade mt-4 flex items-center gap-2 text-sm font-medium">
            <CheckIcon className="h-4 w-4" /> Locked in. Everyone else gets their say in the feed.
          </p>
        )}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button type="button" onClick={again} disabled={outOfMemes} className="btn btn-primary btn-lg">
            <RefreshIcon /> {outOfMemes ? 'Done for today' : 'Make another'}
          </button>
          <Link href="/feed" className="btn btn-secondary btn-lg">
            Open feed <ArrowRightIcon />
          </Link>
        </div>
        <p className="mt-3 text-center text-xs text-muted tabular-nums">
          {outOfMemes ? 'That’s your last one for today.' : `${left} of ${dailyLimit} left today`}
        </p>
      </section>
    )
  }

  if (pending) return <Writing topic={trimmed} />

  return (
    <form onSubmit={submit} className="card p-5 sm:p-6" noValidate>
      <label htmlFor="topic" className="label text-base font-semibold">
        What should it be about?
      </label>
      <input
        ref={inputRef}
        id="topic"
        name="topic"
        value={topic}
        onChange={(e) => {
          setTopic(e.target.value)
          if (error) setError(null)
        }}
        maxLength={topicMax}
        autoComplete="off"
        enterKeyHint="go"
        placeholder="Monday standups, group chats, the gym…"
        disabled={outOfMemes}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby="topic-hint topic-error"
        className="input py-3 text-base"
      />
      <p id="topic-hint" className="hint flex justify-between gap-3">
        <span>A topic, a situation, a mood.</span>
        <span className={`tabular-nums ${topic.length >= topicMax ? 'font-semibold text-foreground' : ''}`}>
          {topic.length}/{topicMax}
        </span>
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="sr-only">Ideas:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setTopic(s)
              setError(null)
            }}
            disabled={outOfMemes}
            aria-pressed={topic === s}
            className={`chip min-h-9 px-3 transition-colors ${
              topic === s ? 'border-foreground bg-foreground text-background' : 'hover:border-foreground/30 hover:bg-surface-2'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div id="topic-error" aria-live="assertive">
        {(error || outOfMemes) && (
          <p role="alert" className={`alert mt-4 flex items-start gap-2 ${outOfMemes ? 'alert-info' : 'alert-error'}`}>
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            {outOfMemes ? `That’s your ${dailyLimit} for today. Come back tomorrow, or go judge the feed.` : error}
          </p>
        )}
      </div>

      {outOfMemes ? (
        <Link href="/feed" className="btn btn-primary btn-lg mt-5 w-full">
          Open the feed <ArrowRightIcon />
        </Link>
      ) : (
        <button type="submit" disabled={trimmed.length < topicMin} className="btn btn-primary btn-lg mt-5 w-full">
          <SparkleIcon className="h-5 w-5" /> Write it
        </button>
      )}
      <p className="mt-3 text-center text-xs text-muted tabular-nums">
        {left} of {dailyLimit} left today
      </p>
    </form>
  )
}
