'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertIcon, RefreshIcon } from '@/components/icons'

// Catches unexpected render/server failures on any page (e.g. the database is unreachable).
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main id="main" className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-20 sm:px-6">
      <div role="alert">
        <p className="eyebrow flex items-center gap-2 border-b border-rule pb-3">
          <AlertIcon className="h-3.5 w-3.5 text-danger" /> Something broke
        </p>
        <h1 className="display mt-6 text-7xl leading-[0.9] sm:text-8xl">
          Well, <span className="mark">that bombed.</span>
        </h1>
        <p className="mt-6 text-muted">Something went wrong on our end. It’s usually temporary.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={() => retry()} className="btn btn-primary btn-lg">
            <RefreshIcon /> Try again
          </button>
          <Link href="/" className="btn btn-secondary btn-lg">
            Back home
          </Link>
        </div>
      </div>
    </main>
  )
}
