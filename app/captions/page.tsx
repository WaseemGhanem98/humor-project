import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CaptionCard from '@/components/CaptionCard'
import { ArrowRightIcon } from '@/components/icons'

export default async function CaptionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: captions, error } = await supabase
    .from('captions')
    .select('id, text')
    .order('id', { ascending: true })

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <header>
        <p className="eyebrow">Caption rating</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Rate captions</h1>
        <p className="mt-2 text-muted text-pretty">
          Thumbs up if it made you smile, thumbs down if it didn’t.
          {captions?.length ? ` ${captions.length} ${captions.length === 1 ? 'caption' : 'captions'} to go.` : ''}
        </p>
      </header>

      {user ? (
        <p className="alert alert-info mt-6">
          You’re signed in. Each click saves a new vote, so you can rate as you go.
        </p>
      ) : (
        <div className="card mt-6 flex flex-col gap-4 border-accent/30 bg-accent/5 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h2 className="font-semibold">You’re browsing as a guest</h2>
            <p className="mt-1 text-sm text-muted">
              Feel free to read the captions. Sign in with Google to vote on them.
            </p>
          </div>
          <Link href="/login" className="btn btn-primary self-start sm:self-auto">
            Sign in to vote <ArrowRightIcon />
          </Link>
        </div>
      )}

      <div className="mt-8">
        {error ? (
          <p role="alert" className="alert alert-error">
            We couldn’t load captions right now. Please refresh to try again.
          </p>
        ) : !captions?.length ? (
          <p className="card text-center text-muted">No captions to rate yet. Check back soon!</p>
        ) : (
          <ul className="space-y-4">
            {captions.map((caption) => (
              <CaptionCard key={caption.id} caption={caption} signedIn={!!user} />
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
