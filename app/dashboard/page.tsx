import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isProfileComplete } from '@/lib/profile'
import Avatar from '@/components/Avatar'
import JokesList from '@/components/JokesList'
import SignOutButton from '@/components/SignOutButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  const displayName = profile?.first_name?.trim() || user.email || 'there'

  return (
    <main className="mx-auto w-full max-w-4xl space-y-10 px-4 py-10">
      <section className="card flex flex-col gap-5 sm:flex-row sm:items-center">
        <Avatar url={profile?.avatar_url ?? null} name={displayName} size="lg" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome, {displayName}!
          </h1>
          <p className="mt-1 text-sm text-muted">
            This page is only visible to signed-in users.
          </p>
          {!isProfileComplete(profile) && (
            <p className="alert alert-warning mt-4">
              Your profile is missing your first or last name.{' '}
              <Link href="/profile" className="font-semibold underline">
                Complete it now
              </Link>
              .
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href="/profile" className="btn btn-primary">
            Edit profile
          </Link>
          <SignOutButton />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Jokes</h2>
        <JokesList />
      </section>
    </main>
  )
}
