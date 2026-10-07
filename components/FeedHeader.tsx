export default function FeedHeader({ count }: { count?: number }) {
  return (
    <header>
      <p className="eyebrow">Meme feed</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Rate the memes</h1>
      <p className="mt-2 text-muted text-pretty">
        Funny or not? One tap tells us which ones actually land.
        {count ? ` ${count} ${count === 1 ? 'meme' : 'memes'} in the feed.` : ''}
      </p>
    </header>
  )
}
