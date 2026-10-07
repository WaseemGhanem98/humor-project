'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertIcon, RefreshIcon } from '@/components/icons'

// Catches unexpected render/server failures on the feed (e.g. the database is unreachable).
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16">
      <div role="alert" className="card flex flex-col items-center px-6 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400">
          <AlertIcon className="h-7 w-7" />
        </span>
        <h1 className="display mt-4 text-xl">That didn’t land</h1>
        <p className="mt-1 max-w-sm text-sm text-muted">Something broke loading the feed. It’s usually temporary.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => retry()} className="btn btn-primary">
            <RefreshIcon /> Try again
          </button>
          <Link href="/" className="btn btn-secondary">
            Back home
          </Link>
        </div>
      </div>
    </main>
  )
}
