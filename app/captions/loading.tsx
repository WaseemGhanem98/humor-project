import FeedHeader from '@/components/FeedHeader'

// Shown while the server fetches captions; mirrors the real card layout to avoid layout shift.
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10 sm:py-12" aria-busy="true">
      <FeedHeader />
      <p className="sr-only" role="status">
        Loading memes…
      </p>
      <ul aria-hidden className="mt-14 space-y-8">
        {[0, 1].map((i) => (
          <li key={i} className="card overflow-hidden p-0">
            <div className="space-y-2.5 px-5 pt-5 pb-4 sm:px-6">
              <div className="skeleton h-6 w-4/5" />
              <div className="skeleton h-6 w-1/2" />
            </div>
            <div className="skeleton aspect-[4/3] w-full rounded-none" />
            <div className="flex gap-2 px-5 py-4 sm:px-6">
              <div className="skeleton h-10 w-28 rounded-full" />
              <div className="skeleton h-10 w-32 rounded-full" />
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
