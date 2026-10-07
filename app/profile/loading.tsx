export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 pt-8 pb-12 sm:pt-12" aria-busy="true">
      <p className="sr-only" role="status">
        Loading your profile…
      </p>
      <div aria-hidden>
        <div className="flex items-center gap-4">
          <div className="skeleton h-14 w-14 rounded-full" />
          <div className="space-y-2">
            <div className="skeleton h-7 w-48" />
            <div className="skeleton h-4 w-36" />
          </div>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-24 rounded-3xl" />
          ))}
        </div>
        <div className="skeleton mt-10 h-64 rounded-3xl" />
      </div>
    </main>
  )
}
