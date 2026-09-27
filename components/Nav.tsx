import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isProfileComplete } from '@/lib/profile'
import { NavLinks, ProfileLink } from '@/components/NavLinks'
import SignOutButton from '@/components/SignOutButton'
import { ArrowRightIcon } from '@/components/icons'

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
  const signedIn = Boolean(user)

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/85 backdrop-blur">
      <nav aria-label="Main" className="mx-auto max-w-5xl px-4">
        <div className="flex h-16 items-center gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2 rounded-lg font-bold tracking-tight">
            <span aria-hidden className="text-2xl">😂</span>
            <span className="text-lg">Humor Project</span>
          </Link>

          <NavLinks signedIn={signedIn} className="hidden items-center gap-1 sm:flex" />

          <div className="ml-auto flex items-center gap-1">
            {user ? (
              <>
                <ProfileLink name={displayName} avatarUrl={profile?.avatar_url ?? null} />
                <SignOutButton compact />
              </>
            ) : (
              <Link href="/login" className="btn btn-primary">
                Log in
              </Link>
            )}
          </div>
        </div>

        {/* Mobile: links get their own full-width row instead of a hidden menu. */}
        <NavLinks signedIn={signedIn} className="-mx-1 flex gap-1 pb-2 sm:hidden" />
      </nav>

      {user && !isProfileComplete(profile) && (
        <div className="border-t border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2.5 text-sm">
            <p>
              <strong>Almost there!</strong> Add your first and last name to finish your profile.
            </p>
            <Link
              href="/profile"
              className="inline-flex items-center gap-1 rounded font-semibold underline underline-offset-2"
            >
              Complete profile <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
