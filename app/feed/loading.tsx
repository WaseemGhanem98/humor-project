// Shown while the server fetches memes; mirrors the real plate layout to avoid layout shift.
export default function Loading() {
  return (
    <main id="main" className="mx-auto w-full max-w-[38rem] px-4 pt-10 pb-16 sm:pt-14" aria-busy="true">
      <header className="mb-8 border-b border-rule pb-6">
        <p className="eyebrow">The feed</p>
        <h1 className="display mt-3 text-[3.4rem] leading-[0.95] sm:text-7xl">
          Funny, <span className="mark">or not?</span>
        </h1>
        <div className="skeleton mt-5 h-5 w-48" />
      </header>
      <p className="sr-only" role="status">
        Loading memes…
      </p>
      <ul aria-hidden className="space-y-10 sm:space-y-14">
        {[0, 1].map((i) => (
          <li key={i} className="plate">
            <div className="flex justify-between border-b border-rule px-4 py-2.5">
              <div className="skeleton h-3 w-14" />
              <div className="skeleton h-3 w-20" />
            </div>
            <div className="skeleton aspect-[4/3] w-full" />
            <div className="space-y-3 border-t border-rule px-5 pt-5 pb-6 sm:px-7">
              <div className="skeleton h-8 w-11/12" />
              <div className="skeleton h-8 w-2/3" />
            </div>
            <div className="grid h-14 grid-cols-2 border-t border-rule sm:h-16">
              <div className="border-r border-rule" />
              <div />
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
