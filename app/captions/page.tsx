import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CaptionCard from '@/components/CaptionCard'

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
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Rate Captions</h1>
        <p className="mt-1 text-muted">
          Upvote the captions that make you laugh, downvote the ones that don’t.
        </p>
      </header>

      {user ? (
        <p className="alert alert-success">
          Signed in as <strong>{user.email}</strong>. Every click records a new
          vote.
        </p>
      ) : (
        <p className="alert alert-warning">
          You’re browsing as a guest.{' '}
          <Link href="/login" className="font-semibold underline">
            Log in
          </Link>{' '}
          to vote on captions.
        </p>
      )}

      {error ? (
        <p className="alert alert-error">Error loading captions: {error.message}</p>
      ) : !captions?.length ? (
        <p className="card text-center text-muted">No captions to show yet.</p>
      ) : (
        <ul className="space-y-4">
          {captions.map((caption) => (
            <CaptionCard key={caption.id} caption={caption} signedIn={!!user} />
          ))}
        </ul>
      )}
    </main>
  )
}
