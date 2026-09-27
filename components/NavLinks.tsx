'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Avatar from '@/components/Avatar'

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}

export function NavLinks({ signedIn, className = '' }: { signedIn: boolean; className?: string }) {
  const pathname = usePathname()
  const links = [
    { href: '/', label: 'Home' },
    { href: '/captions', label: 'Rate captions' },
    ...(signedIn ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
  ]

  return (
    <ul className={className}>
      {links.map(({ href, label }) => {
        const active = isActive(pathname, href)
        return (
          <li key={href} className="flex-1 sm:flex-none">
            <Link
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`block rounded-lg px-2 py-2 text-center text-sm font-medium whitespace-nowrap transition-colors sm:px-3 ${
                active
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted hover:bg-foreground/5 hover:text-foreground'
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

export function ProfileLink({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const active = isActive(usePathname(), '/profile')
  return (
    <Link
      href="/profile"
      aria-current={active ? 'page' : undefined}
      aria-label="Your profile"
      className={`flex items-center gap-2 rounded-full py-1 pr-1 pl-1 text-sm font-medium transition-colors sm:pr-3 ${
        active
          ? 'bg-accent/10 text-accent ring-1 ring-accent/30'
          : 'text-muted hover:bg-foreground/5 hover:text-foreground'
      }`}
    >
      <Avatar url={avatarUrl} name={name} />
      <span className="hidden max-w-[10rem] truncate sm:inline">{name}</span>
    </Link>
  )
}
