export default function Loading() {
  return (
    <main id="main" className="mx-auto w-full max-w-[44rem] px-4 pt-10 pb-16 sm:pt-14" aria-busy="true">
      <p className="sr-only" role="status">
        Loading your profile…
      </p>
      <div aria-hidden>
        <div className="flex items-center gap-5 border-b border-rule pb-6">
          <div className="skeleton h-16 w-16" />
          <div className="space-y-2">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton h-11 w-56" />
            <div className="skeleton h-4 w-40" />
          </div>
        </div>
        <div className="border-b border-rule py-8">
          <div className="skeleton h-3 w-36" />
          <div className="skeleton mt-4 h-28 w-52" />
          <div className="mt-8 h-24 border-y border-rule" />
        </div>
        <div className="mt-14 h-10 border-b border-rule" />
        <div className="skeleton mt-4 h-40" />
      </div>
    </main>
  )
}
