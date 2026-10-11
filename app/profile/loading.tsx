export default function Loading() {
  return (
    <main id="main" className="mx-auto w-full max-w-2xl px-4 pt-8 pb-12 sm:pt-12" aria-busy="true">
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
        <div className="card mt-8 space-y-4 p-5 sm:p-6">
          <div className="skeleton h-3 w-36" />
          <div className="skeleton h-14 w-40" />
          <div className="skeleton h-2.5 w-full rounded-full" />
          <div className="skeleton h-14 w-full" />
        </div>
        <div className="skeleton mt-10 h-7 w-44" />
        <div className="skeleton mt-4 h-40 rounded-3xl" />
      </div>
    </main>
  )
}
