'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { createMeme } from '@/app/create/actions'
import type { VoteValue } from '@/app/feed/actions'
import type { Meme } from '@/lib/memes'
import MemeCard from '@/components/MemeCard'
import Spinner from '@/components/Spinner'
import { AlertIcon, ArrowRightIcon, RefreshIcon, SparkleIcon } from '@/components/icons'

const SUGGESTIONS = ['Monday standups', 'Group chats at 2am', 'Reply-all emails', 'Gym in January', 'Finals week']

type Props = { topicMin: number; topicMax: number }

export default function CreateMeme({ topicMin, topicMax }: Props) {
  const [topic, setTopic] = useState('')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [meme, setMeme] = useState<Meme | null>(null)
  const [vote, setVote] = useState<VoteValue | null>(null)

  const trimmed = topic.trim()

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (pending || trimmed.length < topicMin) return
    setError(null)
    startTransition(async () => {
      try {
        const res = await createMeme(trimmed)
        if (res.ok) {
          setMeme(res.meme)
          setVote(null)
        } else {
          setError(res.message)
        }
      } catch {
        setError('Something went wrong. Check your connection and try again.')
      }
    })
  }

  if (meme) {
    return (
      <div>
        <p role="status" className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <SparkleIcon className="h-4 w-4" /> Fresh from the AI. It’s in the feed now. Is it funny?
        </p>
        <ul>
          <MemeCard meme={meme} signedIn currentVote={vote} onVoted={(_, v) => setVote(v)} priority />
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setMeme(null)
              setTopic('')
            }}
            className="btn btn-primary"
          >
            <RefreshIcon /> Make another
          </button>
          <Link href="/feed" className="btn btn-secondary">
            See it in the feed <ArrowRightIcon />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="card p-5 sm:p-6" aria-busy={pending}>
      <label htmlFor="topic" className="label">
        What should the meme be about?
      </label>
      <input
        id="topic"
        name="topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        maxLength={topicMax}
        minLength={topicMin}
        required
        autoComplete="off"
        placeholder="e.g. Monday standups"
        disabled={pending}
        aria-describedby="topic-hint"
        className="input py-3 text-base"
      />
      <p id="topic-hint" className="hint flex justify-between gap-3">
        <span>A topic, a situation, a mood. The AI writes the caption.</span>
        <span className="tabular-nums">
          {topic.length}/{topicMax}
        </span>
      </p>

      <div className="mt-4 flex flex-wrap gap-2" aria-label="Ideas">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setTopic(s)}
            disabled={pending}
            className="chip hover:border-foreground/30 hover:bg-surface-2"
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="alert alert-error mt-4 flex items-start gap-2">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      <button type="submit" disabled={pending || trimmed.length < topicMin} className="btn btn-primary btn-lg mt-5 w-full">
        {pending ? (
          <>
            <Spinner className="h-5 w-5" /> The AI is writing…
          </>
        ) : (
          <>
            <SparkleIcon className="h-5 w-5" /> Generate with AI
          </>
        )}
      </button>
    </form>
  )
}
