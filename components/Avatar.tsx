type Props = {
  url: string | null
  name: string
  size?: 'sm' | 'lg'
}

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  lg: 'h-24 w-24 text-2xl',
}

export default function Avatar({ url, name, size = 'sm' }: Props) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'

  if (url) {
    return (
      // Plain <img> keeps things simple (no next/image remote config needed).
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={`${name}'s profile photo`}
        className={`${SIZES[size]} shrink-0 rounded-full border border-border object-cover`}
      />
    )
  }

  return (
    <div
      aria-hidden
      className={`${SIZES[size]} flex shrink-0 items-center justify-center rounded-full bg-accent/15 font-semibold text-accent`}
    >
      {initial}
    </div>
  )
}
