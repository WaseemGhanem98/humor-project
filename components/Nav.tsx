import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isProfileComplete } from '@/lib/profile'
import { DesktopLinks, ProfileLink, TabBar } from '@/components/NavLinks'
import Logo from '@/components/Logo'
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
  const dateline = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'America/New_York' }).format(new Date())
  const signedIn = Boolean(user)

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-rule bg-background/90 backdrop-blur-md">
        <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-4 sm:px-6">
          <Link href={signedIn ? '/feed' : '/'} aria-label="Wry home" className="shrink-0">
            <Logo />
          </Link>

          <DesktopLinks signedIn={signedIn} />

          <p className="meta ml-auto hidden text-muted lg:block">{dateline}</p>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            {user ? (
              <>
                <ProfileLink name={displayName} avatarUrl={profile?.avatar_url ?? null} />
                <span className="hidden sm:block">
                  <SignOutButton compact />
                </span>
              </>
            ) : (
              <Link href="/login" className="btn btn-primary hidden sm:inline-flex">
                Sign in
              </Link>
            )}
          </div>
        </nav>
      </header>

      {user && !isProfileComplete(profile) && (
        <div className="border-b border-rule bg-zest text-zest-ink">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2 text-sm sm:px-6">
            <p className="font-medium">Add your name to finish setting up.</p>
            <Link href="/profile#account" className="link inline-flex items-center gap-1 font-semibold">
              Finish profile <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      <TabBar signedIn={signedIn} />
    </>
  )
}
