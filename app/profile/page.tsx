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
import { plateNumber } from '@/components/MemeSource'
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
      className="h-14 w-[4.7rem] shrink-0 border border-rule bg-surface-2 object-cover"
    />
  ) : (
    <span className="flex h-14 w-[4.7rem] shrink-0 items-center justify-center border border-rule bg-surface-2 text-muted">
      <ImageIcon className="h-5 w-5" />
    </span>
  )
}

function SectionHeader({ id, title, count, action }: { id: string; title: string; count?: number; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-rule pb-3">
      <h2 id={id} className="display text-4xl leading-none">
        {title}
        {count ? <span className="meta ml-3 align-middle text-muted tabular-nums">{String(count).padStart(2, '0')}</span> : null}
      </h2>
      {action}
    </div>
  )
}

function Empty({ title, body, href, cta }: { title: string; body: string; href: string; cta: React.ReactNode }) {
  return (
    <div className="border-b border-border py-10 text-center">
      <p className="display text-3xl">{title}</p>
      <p className="mt-2 text-sm text-muted">{body}</p>
      <Link href={href} className="btn btn-primary mt-6">
        {cta}
      </Link>
    </div>
  )
}

const listClass = 'divide-y divide-border border-b border-border'
const linkClass = 'meta inline-flex items-center gap-1 rounded-[2px] hover:underline'

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
    <main id="main" className="mx-auto w-full max-w-[44rem] px-4 pt-10 pb-16 sm:pt-14">
      <header className="flex items-center gap-5 border-b border-rule pb-6">
        <Avatar url={profile?.avatar_url ?? null} name={displayName} size="md" />
        <div className="min-w-0">
          <p className="eyebrow">Your record</p>
          <h1 className="display mt-1 truncate text-5xl leading-none sm:text-6xl">{displayName}</h1>
          <p className="mt-1.5 truncate text-sm text-muted">{user.email}</p>
        </div>
      </header>

      <section aria-labelledby="stats-heading" className="border-b border-rule py-8">
        <h2 id="stats-heading" className="eyebrow">
          Your sense of humor
        </h2>

        {rated === 0 ? (
          <div className="mt-4">
            <p className="display text-6xl leading-none">No verdicts yet.</p>
            <p className="mt-3 text-muted">Judge a few memes and your numbers show up here.</p>
          </div>
        ) : (
          <div className="mt-2 grid items-end gap-x-8 gap-y-4 sm:grid-cols-[auto_1fr]">
            <p className="display text-[7.5rem] leading-[0.85] tracking-[-0.04em] tabular-nums sm:text-[9rem]">
              {funnyPct}
              <span className="text-[0.5em] italic">%</span>
            </p>
            <div className="pb-3">
              <p className="display text-2xl leading-tight italic">of what you’ve judged landed.</p>
              {/* Funny vs Not funny split, sized by your current verdicts. */}
              <div aria-hidden className="mt-4 flex h-3 border border-rule">
                {funny > 0 && <div className="bg-zest" style={{ flexGrow: funny }} />}
                {notFunny > 0 && <div className="bg-foreground" style={{ flexGrow: notFunny }} />}
              </div>
            </div>
          </div>
        )}

        <dl className="mt-8 grid grid-cols-3 border-y border-rule">
          {[
            { label: 'Judged', value: rated, dot: null },
            { label: 'Funny', value: funny, dot: 'bg-zest border border-rule' },
            { label: 'Not funny', value: notFunny, dot: 'bg-foreground' },
          ].map(({ label, value, dot }, i) => (
            <div key={label} className={`px-3 py-4 sm:px-5 ${i > 0 ? 'border-l border-rule' : ''}`}>
              <dt className="meta flex items-center gap-1.5 text-muted">
                {dot && <span aria-hidden className={`h-2 w-2 ${dot}`} />}
                {label}
              </dt>
              <dd className="display mt-1 text-5xl leading-none tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        {total > 0 && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="meta tabular-nums text-muted">
              {String(rated).padStart(2, '0')} of {String(total).padStart(2, '0')} in the feed
            </span>
            {remaining > 0 ? (
              <Link href="/feed" className={linkClass}>
                {remaining} waiting <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span className="meta">All caught up</span>
            )}
          </div>
        )}
      </section>

      <section aria-labelledby="mine-heading" className="mt-14">
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
            title="Nothing yet."
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
              <li key={meme.id} className="flex items-center gap-4 py-3.5">
                <Thumb meme={meme} />
                <div className="min-w-0 flex-1">
                  <p className="display line-clamp-2 text-xl leading-snug">{meme.text}</p>
                  {meme.prompt && <p className="mt-1 truncate text-xs text-muted">Prompt: “<bdi>{meme.prompt}</bdi>”</p>}
                </div>
                <span className="meta hidden shrink-0 text-muted sm:block">{plateNumber(meme.id)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="takes-heading" className="mt-14">
        <SectionHeader id="takes-heading" title="Your takes" count={history.length} />
        {votesError ? (
          <p role="alert" className="alert alert-error mt-4">
            Your takes didn’t load. Refresh to try again.
          </p>
        ) : history.length === 0 ? (
          <Empty
            title="No takes yet."
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
                <li key={v.captionId} className="flex items-center gap-4 py-3.5">
                  <Thumb meme={meme} />
                  <div className="min-w-0 flex-1">
                    <p className="display line-clamp-2 text-xl leading-snug">{meme.text}</p>
                    <p className="meta mt-1 flex items-center gap-1.5 text-muted">
                      {meme.isAi ? 'AI-written' : 'Original'}
                      <span aria-hidden>·</span>
                      {dateFormat.format(new Date(v.votedAt))}
                    </p>
                  </div>
                  <span
                    className={`meta inline-flex shrink-0 items-center gap-1.5 px-2 py-1 ${
                      v.vote === 1 ? 'bg-zest text-zest-ink' : 'bg-foreground text-background'
                    }`}
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

      <section id="account" aria-labelledby="account-heading" className="mt-14 scroll-mt-24">
        <SectionHeader id="account-heading" title="Account" />

        {(error || !profile) && (
          <p role="alert" className="alert alert-error mt-4">
            Your account details didn’t load, so changes may not save. Try signing out and back in.
          </p>
        )}

        <div className="mt-6">
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
