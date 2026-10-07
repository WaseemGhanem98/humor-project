// Wry brand mark: a lopsided smile ("the smirk") on a zest tile, plus a lowercase wordmark.
export function LogoMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className}>
      <rect width="32" height="32" rx="9" fill="var(--zest)" />
      <path d="M8.5 18.5c3.6 4.2 10 4.6 15.5-3.5" fill="none" stroke="var(--zest-ink)" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="24.6" cy="11.6" r="1.9" fill="var(--zest-ink)" />
    </svg>
  )
}

export default function Logo({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark className={size === 'lg' ? 'h-10 w-10' : 'h-7 w-7'} />
      <span className={`display leading-none ${size === 'lg' ? 'text-4xl' : 'text-2xl'}`}>wry</span>
    </span>
  )
}
