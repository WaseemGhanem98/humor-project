// Wry brand: an italic serif wordmark with a highlighter-yellow full stop.
export function LogoMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className}>
      <rect width="32" height="32" fill="var(--foreground)" />
      <rect x="3" y="20" width="26" height="6" fill="var(--zest)" />
      <text x="16" y="24" textAnchor="middle" fontSize="22" fontStyle="italic" fill="var(--background)" className="font-serif">
        W
      </text>
    </svg>
  )
}

export default function Logo({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <span className={`display inline-flex items-baseline leading-none italic ${size === 'lg' ? 'text-5xl' : 'text-[1.85rem]'}`}>
      Wry
      <span aria-hidden className={`ml-[0.06em] inline-block bg-zest ${size === 'lg' ? 'h-2.5 w-2.5' : 'h-[0.42rem] w-[0.42rem]'}`} />
    </span>
  )
}
