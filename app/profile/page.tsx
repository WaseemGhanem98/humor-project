import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { type Profile } from '@/lib/profile'
import { fetchMemes, fetchMemesBy, type Meme } from '@/lib/memes'
import { fetchMyVotes } from '@/lib/votes'
import { verdictStats } from '@/lib/stats'
import Avatar from '@/components/Avatar'
import ProfileForm from '@/components/ProfileForm'
import SignOutButton from '@/components/SignOutButton'
import { ArrowRightIcon, ImageIcon, LaughIcon, MehIcon, SparkleIcon } from '@/components/icons'

export const metadata: Metadata = { title: 'You' }

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })

async function fetchMyMemes(userId: string): Promise<{ memes: Meme[]; failed: boolean }> {
  try {
    const { memes, error } = await fetchMemesBy(createAdminClient(), userId)
    return { memes, failed: Boolean(error) }
  } catch {
    return { memes: [], failed: true }
  }
}

function Thumb({ meme }: { meme: Meme }) {
  return meme.imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={meme.imageUrl}
      alt=""
      loading="lazy"
      decoding="async"
      className="h-14 w-[4.7rem] shrink-0 rounded-xl bg-surface-2 object-cover"
    />
  ) : (
    <span className="flex h-14 w-[4.7rem] shrink-0 items-center justify-center rounded-xl bg-surface-2 text-muted">
      <ImageIcon className="h-5 w-5" />
    </span>
  )
}

function SectionHeader({ id, title, count, action }: { id: string; title: string; count?: number; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 id={id} className="display text-2xl">
        {title}
        {count ? <span className="ml-2 text-lg text-muted tabular-nums">{count}</span> : null}
      </h2>
      {action}
    </div>
  )
}

function Empty({ title, body, href, cta }: { title: string; body: string; href: string; cta: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-3xl border border-dashed border-border px-6 py-10 text-center">
      <p className="display text-xl">{title}</p>
      <p className="mt-1 text-sm text-muted">{body}</p>
      <Link href={href} className="btn btn-primary mt-5">
        {cta}
      </Link>
    </div>
  )
}

const listClass = 'mt-4 divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface'
const linkClass = 'inline-flex items-center gap-1 rounded text-sm font-semibold hover:underline'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [{ data: profile, error }, { memes }, { votes, error: votesError }, mine] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url, created_at')
      .eq('id', user.id)
      .maybeSingle<Profile>(),
    fetchMemes(supabase),
    fetchMyVotes(supabase, user.id),
    fetchMyMemes(user.id),
  ])

  const memeById = new Map((memes ?? []).map((m) => [m.id, m]))
  const stats = verdictStats(votes, new Set(memeById.keys()))
  const { current: history, funny, notFunny, rated, total, remaining, funnyPct } = stats
  const displayName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim() || user.email || 'You'

  return (
    <main id="main" className="mx-auto w-full max-w-2xl px-4 pt-8 pb-12 sm:pt-12">
      <header className="flex items-center gap-4">
        <Avatar url={profile?.avatar_url ?? null} name={displayName} size="md" />
        <div className="min-w-0">
          <h1 className="display truncate text-3xl sm:text-4xl">{displayName}</h1>
          <p className="truncate text-sm text-muted">{user.email}</p>
        </div>
      </header>

      <section aria-labelledby="stats-heading" className="card mt-8 p-5 sm:p-6">
        <h2 id="stats-heading" className="eyebrow">
          Your sense of humor
        </h2>

        {rated === 0 ? (
          <div className="mt-3">
            <p className="display text-3xl">No verdicts yet.</p>
            <p className="mt-1 text-sm text-muted">Judge a few memes and your numbers show up here.</p>
          </div>
        ) : (
          <>
            <p className="mt-3 flex flex-wrap items-baseline gap-x-3">
              <span className="display text-6xl leading-none tabular-nums">{funnyPct}%</span>
              <span className="text-muted">of what you’ve judged landed</span>
            </p>
            {/* Funny vs Not funny split, sized by your current verdicts. */}
            <div aria-hidden className="mt-5 flex h-2.5 gap-1 overflow-hidden rounded-full">
              {funny > 0 && <div className="rounded-full bg-zest" style={{ flexGrow: funny }} />}
              {notFunny > 0 && <div className="rounded-full bg-foreground" style={{ flexGrow: notFunny }} />}
            </div>
          </>
        )}

        <dl className="mt-5 grid grid-cols-3 divide-x divide-border border-t border-border pt-4 text-center">
          <div className="px-2">
            <dt className="text-xs font-medium text-muted">Judged</dt>
            <dd className="display mt-1 text-2xl tabular-nums">{rated}</dd>
          </div>
          <div className="px-2">
            <dt className="flex items-center justify-center gap-1.5 text-xs font-medium text-muted">
              <span aria-hidden className="h-2 w-2 rounded-full bg-zest" /> Funny
            </dt>
            <dd className="display mt-1 text-2xl tabular-nums">{funny}</dd>
          </div>
          <div className="px-2">
            <dt className="flex items-center justify-center gap-1.5 text-xs font-medium text-muted">
              <span aria-hidden className="h-2 w-2 rounded-full bg-foreground" /> Not funny
            </dt>
            <dd className="display mt-1 text-2xl tabular-nums">{notFunny}</dd>
          </div>
        </dl>

        {total > 0 && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-surface-2 px-4 py-3 text-sm">
            <span className="tabular-nums">
              <span className="font-semibold">{rated}</span>
              <span className="text-muted"> of {total} in the feed</span>
            </span>
            {remaining > 0 ? (
              <Link href="/feed" className={linkClass}>
                {remaining} waiting <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span className="font-semibold">All caught up</span>
            )}
          </div>
        )}
      </section>

      <section aria-labelledby="mine-heading" className="mt-10">
        <SectionHeader
          id="mine-heading"
          title="Your AI memes"
          count={mine.memes.length}
          action={
            mine.memes.length > 0 && (
              <Link href="/create" className={linkClass}>
                <SparkleIcon className="h-3.5 w-3.5" /> Make another
              </Link>
            )
          }
        />
        {mine.failed ? (
          <p role="alert" className="alert alert-error mt-4">
            Your memes didn’t load. Refresh to try again.
          </p>
        ) : mine.memes.length === 0 ? (
          <Empty
            title="Nothing yet"
            body="Give the AI a topic and see if it can make anyone laugh."
            href="/create"
            cta={
              <>
                <SparkleIcon /> Make one
              </>
            }
          />
        ) : (
          <ul className={listClass}>
            {mine.memes.map((meme) => (
              <li key={meme.id} className="flex items-center gap-4 p-3 pr-4">
                <Thumb meme={meme} />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold">{meme.text}</p>
                  {meme.prompt && <p className="mt-0.5 truncate text-xs text-muted">on “{meme.prompt}”</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="takes-heading" className="mt-10">
        <SectionHeader id="takes-heading" title="Your takes" count={history.length} />
        {votesError ? (
          <p role="alert" className="alert alert-error mt-4">
            Your takes didn’t load. Refresh to try again.
          </p>
        ) : history.length === 0 ? (
          <Empty
            title="No takes yet"
            body="Every Funny and Not funny you call lands here."
            href="/feed"
            cta={
              <>
                Open the feed <ArrowRightIcon />
              </>
            }
          />
        ) : (
          <ul className={listClass}>
            {history.map((v) => {
              const meme = memeById.get(v.captionId)!
              return (
                <li key={v.captionId} className="flex items-center gap-4 p-3 pr-4">
                  <Thumb meme={meme} />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold">{meme.text}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                      {meme.isAi ? (
                        <>
                          <SparkleIcon className="h-3 w-3" /> AI-written
                        </>
                      ) : (
                        'Original'
                      )}
                      <span aria-hidden>·</span>
                      {dateFormat.format(new Date(v.votedAt))}
                    </p>
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

        {(error || !profile) && (
          <p role="alert" className="alert alert-error mt-4">
            Your account details didn’t load, so changes may not save. Try signing out and back in.
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
