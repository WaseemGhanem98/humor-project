'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Avatar from '@/components/Avatar'
import { FeedIcon, HomeIcon, LogInIcon, UserIcon } from '@/components/icons'

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}

export function DesktopLinks({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname()
  const links = [
    ...(signedIn ? [] : [{ href: '/', label: 'Home' }]),
    { href: '/feed', label: 'Feed' },
    ...(signedIn ? [{ href: '/profile', label: 'You' }] : []),
  ]

  return (
    <ul className="hidden items-center gap-1 sm:flex">
      {links.map(({ href, label }) => {
        const active = isActive(pathname, href)
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`block rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                active ? 'bg-foreground text-background' : 'text-muted hover:bg-foreground/5 hover:text-foreground'
              }`}
            >
              {label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

// Mobile: primary navigation lives in a bottom tab bar, inside the thumb zone.
export function TabBar({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname()
  const tabs = signedIn
    ? [
        { href: '/feed', label: 'Feed', Icon: FeedIcon },
        { href: '/profile', label: 'You', Icon: UserIcon },
      ]
    : [
        { href: '/', label: 'Home', Icon: HomeIcon },
        { href: '/feed', label: 'Feed', Icon: FeedIcon },
        { href: '/login', label: 'Sign in', Icon: LogInIcon },
      ]

  return (
    <nav
      aria-label="Tabs"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden"
    >
      <ul className="flex">
        {tabs.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href)
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex h-[4.5rem] flex-col items-center justify-center gap-1 text-[0.7rem] font-semibold transition-colors ${
                  active ? 'text-foreground' : 'text-muted'
                }`}
              >
                <span
                  className={`flex h-8 w-14 items-center justify-center rounded-full transition-colors ${
                    active ? 'bg-zest text-zest-ink' : ''
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function ProfileLink({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const active = isActive(usePathname(), '/profile')
  return (
    <Link
      href="/profile"
      aria-current={active ? 'page' : undefined}
      aria-label="Your profile"
      className={`flex items-center gap-2 rounded-full p-1 text-sm font-semibold transition-colors sm:pr-3 ${
        active ? 'bg-foreground/5 ring-1 ring-border' : 'text-muted hover:bg-foreground/5 hover:text-foreground'
      }`}
    >
      <Avatar url={avatarUrl} name={name} />
      <span className="hidden max-w-[10rem] truncate sm:inline">{name}</span>
    </Link>
  )
}
