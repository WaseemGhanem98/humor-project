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
    <div className="plate animate-fade" aria-busy="true">
      <div className="flex items-center justify-between gap-3 border-b border-rule px-4 py-2.5">
        <span className="meta text-muted">No. ———</span>
        <span className="meta inline-flex items-center gap-1.5 bg-zest px-1.5 py-0.5 text-zest-ink">
          <SparkleIcon className="h-3 w-3 animate-pulse motion-reduce:animate-none" /> AI-written
        </span>
      </div>
      <div className="skeleton aspect-[4/3] w-full" />
      <div className="border-t border-rule px-5 pt-5 pb-6 sm:px-7">
        <p role="status" className="display text-[1.85rem] leading-[1.08] italic sm:text-[2.35rem]">
          {WRITING_STEPS[step]}
          <span aria-hidden className="animate-caret ml-1 inline-block h-[0.8em] w-[0.08em] translate-y-[0.08em] bg-foreground" />
        </p>
        <p className="mt-3 truncate text-sm text-muted">
          <span aria-hidden className="meta mr-2">Prompt</span>“<bdi>{topic}</bdi>”
        </p>
      </div>
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
        <p className="eyebrow">Hot off the press</p>
        <h2 id="result-heading" ref={resultRef} tabIndex={-1} className="display mt-2 text-5xl leading-none outline-none">
          Fresh one. <span className="mark">Is it funny?</span>
        </h2>
        <p className="mt-3 mb-6 text-muted">It’s live in the feed. Cast the first vote.</p>
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
            <CheckIcon className="h-4 w-4" /> Locked in. The rest of the feed gets its say.
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
        <p className="meta mt-4 text-center text-muted tabular-nums">
          {outOfMemes ? 'That was your last one today' : `${left} of ${dailyLimit} left today`}
        </p>
      </section>
    )
  }

  if (pending) return <Writing topic={trimmed} />

  return (
    <form onSubmit={submit} noValidate>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor="topic" className="eyebrow">
          The topic
        </label>
        <span className={`meta tabular-nums ${topic.length >= topicMax ? 'text-foreground' : 'text-muted'}`}>
          {topic.length}/{topicMax}
        </span>
      </div>
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
        dir="auto"
        placeholder="Monday standups…"
        disabled={outOfMemes}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby="topic-hint topic-error"
        className="display mt-2 w-full rounded-none border-0 border-b-2 border-rule bg-transparent px-0 pt-1 pb-3 text-[2.4rem] leading-tight outline-none placeholder:text-muted/50 placeholder:italic focus:border-b-[3px] focus-visible:outline-none disabled:opacity-50 sm:text-5xl"
      />
      <p id="topic-hint" className="hint">
        A topic, a situation, a mood. The AI takes it from there.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="eyebrow mr-1">Try</span>
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
            className={`chip min-h-9 px-2.5 transition-colors ${
              topic === s ? 'border-rule bg-foreground text-background' : 'hover:border-rule'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div id="topic-error" aria-live="assertive">
        {(error || outOfMemes) && (
          <p role="alert" className={`alert mt-6 flex items-start gap-2 ${outOfMemes ? 'alert-info' : 'alert-error'}`}>
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            {outOfMemes ? `That’s your ${dailyLimit} for today. Come back tomorrow, or go judge the feed.` : error}
          </p>
        )}
      </div>

      <div className="mt-8 flex items-center gap-4">
        {outOfMemes ? (
          <Link href="/feed" className="btn btn-primary btn-lg flex-1">
            Open the feed <ArrowRightIcon />
          </Link>
        ) : (
          <button type="submit" disabled={trimmed.length < topicMin} className="btn btn-primary btn-lg flex-1">
            <SparkleIcon className="h-5 w-5" /> Write it
          </button>
        )}
        <p className="meta shrink-0 text-right leading-tight text-muted tabular-nums">
          {left} of {dailyLimit}
          <br />
          left today
        </p>
      </div>
    </form>
  )
}
