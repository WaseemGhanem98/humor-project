import Link from 'next/link'

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-20 sm:px-6">
      <p className="eyebrow border-b border-rule pb-3">Error 404 · Page not found</p>
      <h1 className="display mt-6 text-[5.5rem] leading-[0.85] sm:text-9xl">
        That didn’t <span className="mark">land.</span>
      </h1>
      <p className="mt-6 text-muted">This page doesn’t exist, or it moved.</p>
      <div className="mt-8">
        <Link href="/feed" className="btn btn-primary btn-lg">
          Go to the feed
        </Link>
      </div>
    </main>
  )
}
