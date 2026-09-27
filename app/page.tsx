import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import JokesList from '@/components/JokesList'
import { ArrowRightIcon, ThumbDownIcon, ThumbUpIcon } from '@/components/icons'

export default async function Home() {
  const supabase = await createClient()
  const [
    {
      data: { user },
    },
    { count: captionCount },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('captions').select('id', { count: 'exact', head: true }),
  ])

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:py-14">
      <section className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="eyebrow">The Humor Project</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Help figure out what’s actually funny.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted text-pretty">
            Warm up with a few jokes, then rate captions with a quick thumbs up or
            thumbs down. Your votes help show which ones really land.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/captions" className="btn btn-primary btn-lg">
              Rate captions <ArrowRightIcon />
            </Link>
            {user ? (
              <Link href="/dashboard" className="btn btn-secondary btn-lg">
                Go to your dashboard
              </Link>
            ) : (
              <Link href="/login" className="btn btn-secondary btn-lg">
                Sign in with Google
              </Link>
            )}
          </div>
        </div>

        <div className="card space-y-5">
          <h2 className="font-semibold">What you can do here</h2>
          <ol className="space-y-4">
            <li className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                1
              </span>
              <div>
                <p className="font-medium">Browse jokes</p>
                <p className="text-sm text-muted">No account needed. Scroll down to read them.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                2
              </span>
              <div>
                <p className="flex flex-wrap items-center gap-1.5 font-medium">
                  Rate captions
                  <ThumbUpIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <ThumbDownIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                </p>
                <p className="text-sm text-muted">
                  {captionCount
                    ? `${captionCount} ${captionCount === 1 ? 'caption is' : 'captions are'} ready for your vote.`
                    : 'Vote on captions you find funny (or not).'}{' '}
                  {user ? 'You’re signed in and ready to go.' : 'Sign in with Google to vote.'}
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section aria-labelledby="jokes-heading" className="mt-16">
        <div className="mb-5">
          <h2 id="jokes-heading" className="text-2xl font-bold tracking-tight">
            Jokes to warm up with
          </h2>
          <p className="mt-1 text-muted">A few quick ones before you start rating.</p>
        </div>
        <JokesList />
      </section>
    </main>
  )
}
