import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { type Profile } from '@/lib/profile'
import { fetchMemes } from '@/lib/memes'
import { fetchMyVotes } from '@/lib/votes'
import Avatar from '@/components/Avatar'
import ProfileForm from '@/components/ProfileForm'
import SignOutButton from '@/components/SignOutButton'
import { ArrowRightIcon, ImageIcon, LaughIcon, MehIcon } from '@/components/icons'

export const metadata: Metadata = { title: 'You' }

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [{ data: profile, error }, { memes }, { votes, error: votesError }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url, created_at')
      .eq('id', user.id)
      .maybeSingle<Profile>(),
    fetchMemes(supabase),
    fetchMyVotes(supabase, user.id),
  ])

  const memeById = new Map((memes ?? []).map((m) => [m.id, m]))
  const history = votes.filter((v) => memeById.has(v.captionId))
  const funny = history.filter((v) => v.vote === 1).length
  const notFunny = history.length - funny
  const total = memes?.length ?? 0
  const displayName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim() || user.email || 'You'

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pt-8 pb-12 sm:pt-12">
      <header className="flex items-center gap-4">
        <Avatar url={profile?.avatar_url ?? null} name={displayName} size="md" />
        <div className="min-w-0">
          <h1 className="display truncate text-3xl sm:text-4xl">{displayName}</h1>
          <p className="truncate text-sm text-muted">{user.email}</p>
        </div>
      </header>

      <section aria-labelledby="stats-heading" className="mt-8">
        <h2 id="stats-heading" className="sr-only">
          Your stats
        </h2>
        <dl className="grid grid-cols-3 gap-3">
          <div className="card p-4 sm:p-5">
            <dt className="text-xs font-medium text-muted">Rated</dt>
            <dd className="display mt-1 text-3xl">
              {history.length}
              {total > 0 && <span className="text-base text-muted"> / {total}</span>}
            </dd>
          </div>
          <div className="card border-zest bg-zest p-4 text-zest-ink sm:p-5">
            <dt className="text-xs font-medium opacity-70">Funny</dt>
            <dd className="display mt-1 text-3xl">{funny}</dd>
          </div>
          <div className="card p-4 sm:p-5">
            <dt className="text-xs font-medium text-muted">Not funny</dt>
            <dd className="display mt-1 text-3xl">{notFunny}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="takes-heading" className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <h2 id="takes-heading" className="display text-2xl">
            Your takes
          </h2>
          {history.length > 0 && history.length < total && (
            <Link href="/feed" className="inline-flex items-center gap-1 rounded text-sm font-semibold hover:underline">
              {total - history.length} left <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {votesError ? (
          <p role="alert" className="alert alert-error mt-4">
            We couldn’t load your takes right now. Refresh to try again.
          </p>
        ) : history.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-dashed border-border px-6 py-10 text-center">
            <p className="display text-xl">No verdicts yet</p>
            <p className="mt-1 text-sm text-muted">Your funny / not funny calls will show up here.</p>
            <Link href="/feed" className="btn btn-primary mt-5">
              Open the feed <ArrowRightIcon />
            </Link>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface">
            {history.map((v) => {
              const meme = memeById.get(v.captionId)!
              return (
                <li key={v.captionId} className="flex items-center gap-4 p-3 pr-4">
                  {meme.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={meme.imageUrl} alt="" className="h-14 w-[4.7rem] shrink-0 rounded-xl object-cover" />
                  ) : (
                    <span className="flex h-14 w-[4.7rem] shrink-0 items-center justify-center rounded-xl bg-surface-2 text-muted">
                      <ImageIcon className="h-5 w-5" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold">{meme.text}</p>
                    <p className="mt-0.5 text-xs text-muted">{dateFormat.format(new Date(v.votedAt))}</p>
                  </div>
                  <span
                    className={`chip shrink-0 ${v.vote === 1 ? 'border-zest bg-zest text-zest-ink' : 'border-foreground bg-foreground text-background'}`}
                  >
                    {v.vote === 1 ? <LaughIcon className="h-3.5 w-3.5" /> : <MehIcon className="h-3.5 w-3.5" />}
                    {v.vote === 1 ? 'Funny' : 'Not funny'}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section id="account" aria-labelledby="account-heading" className="mt-12 scroll-mt-24">
        <h2 id="account-heading" className="display text-2xl">
          Account
        </h2>

        {error && (
          <p role="alert" className="alert alert-error mt-4">
            We couldn’t load your profile: {error.message}
          </p>
        )}
        {!error && !profile && (
          <p role="alert" className="alert alert-error mt-4">
            We couldn’t find a profile for your account, so changes may not save. Try signing out and back in.
          </p>
        )}

        <div className="mt-4">
          <ProfileForm
            userId={user.id}
            email={user.email ?? ''}
            initialFirstName={profile?.first_name ?? ''}
            initialLastName={profile?.last_name ?? ''}
            initialAvatarUrl={profile?.avatar_url ?? null}
          />
        </div>

        <div className="mt-6 flex justify-end">
          <SignOutButton />
        </div>
      </section>
    </main>
  )
}
