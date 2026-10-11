import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { fetchMemes } from '@/lib/memes'
import { fetchMyVotes } from '@/lib/votes'
import type { VoteValue } from '@/app/feed/actions'
import Feed from '@/components/Feed'
import { ArrowRightIcon, ImageIcon, SparkleIcon } from '@/components/icons'

export const metadata: Metadata = { title: 'Feed' }

export default async function FeedPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ memes, error }, myVotes] = await Promise.all([
    fetchMemes(supabase),
    user ? fetchMyVotes(supabase, user.id) : Promise.resolve({ votes: [] }),
  ])

  const initialVotes: Record<number, VoteValue> = {}
  for (const v of myVotes.votes) initialVotes[v.captionId] = v.vote

  const aiCount = memes?.filter((m) => m.isAi).length ?? 0

  return (
    <main id="main" className="mx-auto w-full max-w-[38rem] px-4 pt-10 pb-16 sm:pt-14">
      <header className="mb-8 border-b border-rule pb-6">
        <p className="eyebrow">The feed · {aiCount} AI-written</p>
        <h1 className="display mt-3 text-[3.4rem] leading-[0.95] sm:text-7xl">
          Funny, <span className="mark">or not?</span>
        </h1>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <p className="text-muted">AI writes it. You judge it.</p>
          {user ? (
            <Link href="/create" className="btn btn-zest">
              <SparkleIcon /> Make one
            </Link>
          ) : (
            <Link href="/login" className="link inline-flex items-center gap-1 text-sm font-semibold">
              Sign in to judge <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </header>

      {error ? (
        <div role="alert" className="plate px-6 py-12 text-center">
          <p className="display text-3xl">The feed didn’t load.</p>
          <p className="mt-2 text-sm text-muted">Probably a hiccup on our end. Give it another go.</p>
          <Link href="/feed" className="btn btn-primary mt-6">
            Try again
          </Link>
        </div>
      ) : !memes?.length ? (
        <div className="plate px-6 py-14 text-center">
          <ImageIcon className="mx-auto h-8 w-8 text-muted" />
          <p className="display mt-4 text-3xl">Nothing here yet.</p>
          <p className="mt-2 text-sm text-muted">Give the AI a topic and get things started.</p>
          <Link href={user ? '/create' : '/login'} className="btn btn-primary mt-6">
            <SparkleIcon /> Make the first one
          </Link>
        </div>
      ) : (
        <Feed memes={memes} signedIn={!!user} initialVotes={initialVotes} />
      )}
    </main>
  )
}
