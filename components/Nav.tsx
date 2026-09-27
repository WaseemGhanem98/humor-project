import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isProfileComplete } from '@/lib/profile'
import Avatar from '@/components/Avatar'
import SignOutButton from '@/components/SignOutButton'

export default async function Nav() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle()
    : { data: null }

  const displayName = profile?.first_name?.trim() || user?.email || ''

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur">
      <nav className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          😂 Humor Project
        </Link>

        <div className="ml-auto flex items-center gap-1 text-sm sm:gap-2">
          <Link
            href="/captions"
            className="rounded-lg px-3 py-2 font-medium text-muted hover:bg-foreground/5 hover:text-foreground"
          >
            Rate Captions
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-lg px-3 py-2 font-medium text-muted hover:bg-foreground/5 hover:text-foreground"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 font-medium text-muted hover:bg-foreground/5 hover:text-foreground"
              >
                <Avatar url={profile?.avatar_url ?? null} name={displayName} />
                <span className="hidden sm:inline">Profile</span>
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link href="/login" className="btn btn-primary">
              Log in
            </Link>
          )}
        </div>
      </nav>

      {user && !isProfileComplete(profile) && (
        <div className="border-t border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm">
            <span>
              <strong>Almost there!</strong> Add your first and last name to
              finish setting up your profile.
            </span>
            <Link href="/profile" className="font-semibold underline underline-offset-2">
              Complete profile →
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
