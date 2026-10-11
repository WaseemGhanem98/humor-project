// Mirrors the /create layout while the page (and today's quota) loads.
export default function Loading() {
  return (
    <main id="main" className="mx-auto w-full max-w-[38rem] px-4 pt-10 pb-16 sm:pt-14" aria-busy="true">
      <p className="sr-only" role="status">
        Loading…
      </p>
      <div aria-hidden>
        <div className="border-b border-rule pb-6">
          <div className="skeleton h-3 w-44" />
          <div className="skeleton mt-4 h-14 w-4/5" />
          <div className="skeleton mt-5 h-5 w-full" />
        </div>
        <div className="mt-10 skeleton h-3 w-20" />
        <div className="mt-4 h-14 border-b-2 border-rule" />
        <div className="mt-6 flex flex-wrap gap-2">
          {[28, 36, 30, 26, 24].map((w) => (
            <div key={w} className="skeleton h-9" style={{ width: `${w * 0.25}rem` }} />
          ))}
        </div>
        <div className="skeleton mt-8 h-13 w-full" />
      </div>
    </main>
  )
}
