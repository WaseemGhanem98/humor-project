import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { fetchMemes } from '@/lib/memes'
import CaptionCard from '@/components/CaptionCard'
import FeedHeader from '@/components/FeedHeader'
import { ArrowRightIcon, ImageIcon, ThumbDownIcon, ThumbUpIcon } from '@/components/icons'

export default async function CaptionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { memes, error } = await fetchMemes(supabase)

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10 sm:py-12">
      <FeedHeader count={memes?.length ?? 0} />

      {user ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-muted">
          <span className="flex gap-1" aria-hidden>
            <ThumbUpIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
            <ThumbDownIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
          </span>
          Each click saves a new vote, so rate as you scroll.
        </p>
      ) : (
        <div className="card mt-6 flex flex-col gap-4 border-accent/30 bg-accent/5 p-5 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h2 className="font-semibold">You’re browsing as a guest</h2>
            <p className="mt-1 text-sm text-muted">
              Scroll through the memes freely. Sign in with Google to vote on them.
            </p>
          </div>
          <Link href="/login" className="btn btn-primary self-start sm:self-auto">
            Sign in to vote <ArrowRightIcon />
          </Link>
        </div>
      )}

      <div className="mt-8">
        {error ? (
          <div role="alert" className="card flex flex-col items-center px-6 py-12 text-center">
            <p className="text-lg font-semibold">We couldn’t load the memes</p>
            <p className="mt-1 max-w-sm text-sm text-muted">
              Something went wrong reaching the database. Please refresh to try again.
            </p>
            <Link href="/captions" className="btn btn-secondary mt-5">
              Try again
            </Link>
          </div>
        ) : !memes?.length ? (
          <div className="card flex flex-col items-center px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <ImageIcon className="h-7 w-7" />
            </span>
            <p className="mt-4 text-lg font-semibold">No memes yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted">
              Nothing to rate right now. Check back soon, or warm up with the jokes on the homepage.
            </p>
            <Link href="/" className="btn btn-secondary mt-5">
              Read the jokes
            </Link>
          </div>
        ) : (
          <ul className="space-y-8">
            {memes.map((meme, index) => (
              <CaptionCard key={meme.id} meme={meme} signedIn={!!user} priority={index === 0} />
            ))}
          </ul>
        )}
      </div>

      {!!memes?.length && (
        <p className="mt-10 text-center text-sm text-muted">You’ve reached the end. Nice scrolling.</p>
      )}
    </main>
  )
}
