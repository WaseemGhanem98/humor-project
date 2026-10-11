type Props = {
  url: string | null
  name: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: 'h-8 w-8 text-base',
  md: 'h-16 w-16 text-3xl',
  lg: 'h-24 w-24 text-5xl',
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
        className={`${SIZES[size]} shrink-0 border border-rule object-cover`}
      />
    )
  }

  return (
    <div
      aria-hidden
      className={`${SIZES[size]} flex shrink-0 items-center justify-center border border-rule bg-zest font-serif text-zest-ink italic`}
    >
      {initial}
    </div>
  )
}
