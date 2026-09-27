import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isProfileComplete } from '@/lib/profile'
import Avatar from '@/components/Avatar'
import SignOutButton from '@/components/SignOutButton'
import { ArrowRightIcon, CheckIcon, ThumbDownIcon, ThumbUpIcon } from '@/components/icons'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [{ data: profile }, { count: captionCount }, { count: jokeCount }] = await Promise.all([
    supabase
      .from('profiles')
      .select('first_name, last_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle(),
    supabase.from('captions').select('id', { count: 'exact', head: true }),
    supabase.from('jokes').select('id', { count: 'exact', head: true }),
  ])

  const firstName = profile?.first_name?.trim()
  const displayName = firstName || user.email || 'there'
  const profileComplete = isProfileComplete(profile)
  const checklist = [
    { label: 'First name', done: Boolean(firstName) },
    { label: 'Last name', done: Boolean(profile?.last_name?.trim()) },
    { label: 'Profile photo', done: Boolean(profile?.avatar_url) },
  ]

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <header className="flex flex-wrap items-center gap-4">
        <Avatar url={profile?.avatar_url ?? null} name={displayName} size="md" />
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold tracking-tight break-words">Welcome, {displayName}!</h1>
          <p className="mt-1 truncate text-sm text-muted">Signed in as {user.email}</p>
        </div>
      </header>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <section className="card flex flex-col border-accent/30 bg-accent/5 md:row-span-2">
          <p className="eyebrow">Up next</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">Rate some captions</h2>
          <p className="mt-2 text-muted">
            {captionCount
              ? `${captionCount} ${captionCount === 1 ? 'caption is' : 'captions are'} waiting.`
              : 'Captions will show up here when they’re available.'}{' '}
            Give each one a thumbs up or thumbs down.
          </p>
          <div aria-hidden className="my-6 flex gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
              <ThumbUpIcon className="h-6 w-6" />
            </span>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400">
              <ThumbDownIcon className="h-6 w-6" />
            </span>
          </div>
          <Link href="/captions" className="btn btn-primary btn-lg mt-auto self-start">
            Start rating <ArrowRightIcon />
          </Link>
        </section>

        <section className="card">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-semibold">Your profile</h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                profileComplete
                  ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                  : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
              }`}
            >
              {profileComplete ? 'Complete' : 'Needs your name'}
            </span>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-center gap-2">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full ${
                    item.done ? 'bg-accent text-accent-foreground' : 'border border-border'
                  }`}
                >
                  {item.done && <CheckIcon className="h-3 w-3" />}
                </span>
                <span className={item.done ? '' : 'text-muted'}>{item.label}</span>
                <span className="sr-only">{item.done ? '(added)' : '(missing)'}</span>
              </li>
            ))}
          </ul>
          <Link href="/profile" className="btn btn-secondary mt-5">
            {profileComplete ? 'Edit profile' : 'Finish your profile'}
          </Link>
        </section>

        <section className="card">
          <h2 className="text-lg font-semibold">Need a warm-up?</h2>
          <p className="mt-2 text-sm text-muted">
            {jokeCount
              ? `There ${jokeCount === 1 ? 'is 1 joke' : `are ${jokeCount} jokes`} on the homepage.`
              : 'Check the homepage for jokes.'}
          </p>
          <Link href="/" className="btn btn-secondary mt-5">
            Read the jokes
          </Link>
        </section>
      </div>

      <div className="mt-10 flex justify-end border-t border-border pt-6">
        <SignOutButton />
      </div>
    </main>
  )
}
