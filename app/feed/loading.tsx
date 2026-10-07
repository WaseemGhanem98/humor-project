// Shown while the server fetches memes; mirrors the real card layout to avoid layout shift.
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 pt-8 pb-12 sm:pt-12" aria-busy="true">
      <h1 className="display mb-6 text-4xl sm:text-5xl">
        Funny, <span className="mark">or not?</span>
      </h1>
      <p className="sr-only" role="status">
        Loading memes…
      </p>
      <ul aria-hidden className="space-y-6 sm:space-y-8">
        {[0, 1].map((i) => (
          <li key={i} className="card overflow-hidden p-0">
            <div className="space-y-2.5 px-5 pt-5 pb-4 sm:px-6">
              <div className="skeleton h-6 w-4/5" />
              <div className="skeleton h-6 w-1/2" />
            </div>
            <div className="skeleton aspect-[4/3] w-full rounded-none" />
            <div className="flex gap-2 px-4 py-4 sm:px-5">
              <div className="skeleton h-12 flex-1 rounded-2xl" />
              <div className="skeleton h-12 flex-1 rounded-2xl" />
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
