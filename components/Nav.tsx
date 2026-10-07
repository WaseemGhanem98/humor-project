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
  const signedIn = Boolean(user)

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <nav aria-label="Main" className="mx-auto flex h-16 max-w-5xl items-center gap-6 px-4">
          <Link href={signedIn ? '/feed' : '/'} aria-label="Wry home" className="shrink-0 rounded-lg">
            <Logo />
          </Link>

          <DesktopLinks signedIn={signedIn} />

          <div className="ml-auto flex items-center gap-1">
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

        {user && !isProfileComplete(profile) && (
          <div className="border-t border-border/70 bg-zest/90 text-zest-ink">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2 text-sm">
              <p className="font-medium">Add your name to finish setting up.</p>
              <Link
                href="/profile#account"
                className="inline-flex items-center gap-1 rounded font-semibold underline underline-offset-2"
              >
                Finish profile <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </header>

      <TabBar signedIn={signedIn} />
    </>
  )
}
