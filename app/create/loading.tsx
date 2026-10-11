// Mirrors the /create layout while the page (and today's quota) loads.
export default function Loading() {
  return (
    <main id="main" className="mx-auto w-full max-w-xl px-4 pt-8 pb-12 sm:pt-12" aria-busy="true">
      <p className="sr-only" role="status">
        Loading…
      </p>
      <div aria-hidden>
        <div className="skeleton h-3 w-32" />
        <div className="skeleton mt-3 h-11 w-3/4" />
        <div className="skeleton mt-4 h-5 w-full" />
        <div className="card mt-6 space-y-4 p-5 sm:p-6">
          <div className="skeleton h-5 w-48" />
          <div className="skeleton h-12 w-full rounded-xl" />
          <div className="flex flex-wrap gap-2">
            {[28, 36, 30, 26, 24].map((w) => (
              <div key={w} className="skeleton h-9 rounded-full" style={{ width: `${w * 0.25}rem` }} />
            ))}
          </div>
          <div className="skeleton h-12 w-full rounded-full" />
        </div>
      </div>
    </main>
  )
}
