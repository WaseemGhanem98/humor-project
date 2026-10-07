import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <p className="display text-7xl">404</p>
      <h1 className="display mt-4 text-2xl">This page didn’t land.</h1>
      <p className="mt-2 text-muted">It doesn’t exist, or it moved.</p>
      <Link href="/feed" className="btn btn-primary mt-6">
        Go to the feed
      </Link>
    </main>
  )
}
