import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { fetchMemes } from '@/lib/memes'
import { fetchMyVotes } from '@/lib/votes'
import type { VoteValue } from '@/app/feed/actions'
import Feed from '@/components/Feed'
import { ArrowRightIcon, ImageIcon } from '@/components/icons'

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

  return (
    <main className="mx-auto w-full max-w-xl px-4 pt-8 pb-12 sm:pt-12">
      <header className="mb-6">
        <h1 className="display text-4xl sm:text-5xl">
          Funny, <span className="mark">or not?</span>
        </h1>
        {!user && (
          <p className="mt-3 flex flex-wrap items-center gap-x-2 text-muted">
            Browse freely.
            <Link href="/login" className="inline-flex items-center gap-1 rounded font-semibold text-foreground underline-offset-4 hover:underline">
              Sign in to vote <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </p>
        )}
      </header>

      {error ? (
        <div role="alert" className="card flex flex-col items-center px-6 py-12 text-center">
          <p className="display text-xl">The feed didn’t load</p>
          <p className="mt-1 max-w-sm text-sm text-muted">We couldn’t reach the database. Give it another go.</p>
          <Link href="/feed" className="btn btn-primary mt-5">
            Try again
          </Link>
        </div>
      ) : !memes?.length ? (
        <div className="card flex flex-col items-center px-6 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zest text-zest-ink">
            <ImageIcon className="h-7 w-7" />
          </span>
          <p className="display mt-4 text-xl">Nothing here yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted">The feed is empty right now. Check back soon.</p>
          <Link href="/" className="btn btn-secondary mt-5">
            Back home
          </Link>
        </div>
      ) : (
        <Feed memes={memes} signedIn={!!user} initialVotes={initialVotes} />
      )}
    </main>
  )
}
