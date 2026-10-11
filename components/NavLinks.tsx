'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Avatar from '@/components/Avatar'
import { FeedIcon, HomeIcon, LogInIcon, SparkleIcon, UserIcon } from '@/components/icons'

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}

export function DesktopLinks({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname()
  const links = [
    ...(signedIn ? [] : [{ href: '/', label: 'Home' }]),
    { href: '/feed', label: 'Feed' },
    ...(signedIn ? [{ href: '/create', label: 'Make' }] : []),
  ]

  return (
    <ul className="hidden items-center gap-6 sm:flex">
      {links.map(({ href, label }) => {
        const active = isActive(pathname, href)
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`meta relative block py-2 transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-foreground after:transition-transform ${
                active ? 'text-foreground after:scale-x-100' : 'text-muted after:scale-x-0 hover:text-foreground'
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
        { href: '/create', label: 'Make', Icon: SparkleIcon },
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
      className="fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden"
    >
      <ul className="flex">
        {tabs.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href)
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`relative flex h-16 flex-col items-center justify-center gap-1.5 transition-colors ${
                  active ? 'text-foreground' : 'text-muted'
                }`}
              >
                {active && <span aria-hidden className="absolute inset-x-6 top-0 h-[3px] bg-zest" />}
                <Icon className="h-5 w-5" />
                <span className="meta text-[0.62rem]">{label}</span>
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
      className={`flex items-center gap-2.5 rounded-[3px] p-1 text-sm font-medium transition-colors sm:pr-2 ${
        active ? 'text-foreground' : 'text-muted hover:text-foreground'
      }`}
    >
      <Avatar url={avatarUrl} name={name} />
      <span className={`hidden max-w-[10rem] truncate sm:inline ${active ? 'underline decoration-2 underline-offset-4' : ''}`}>{name}</span>
    </Link>
  )
}
