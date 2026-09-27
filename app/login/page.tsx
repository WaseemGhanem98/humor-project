import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GoogleSignInButton from '@/components/GoogleSignInButton'
import { AlertIcon, CheckIcon } from '@/components/icons'

export default async function LoginPage({
  searchParams,
}: PageProps<'/login'>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  const { error } = await searchParams

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div aria-hidden className="text-4xl">😂</div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Sign in to start rating</h1>
          <p className="mt-2 text-muted">
            Anyone can read jokes and browse captions. Signing in lets you:
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              Upvote or downvote captions
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              Add your name and a profile photo
            </li>
          </ul>

          {typeof error === 'string' && (
            <div role="alert" className="alert alert-error mt-6 flex items-start gap-2">
              <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">Sign-in didn’t work</p>
                <p className="mt-0.5 break-words">{error}</p>
              </div>
            </div>
          )}

          <div className="mt-6">
            <GoogleSignInButton />
          </div>
          <p className="mt-3 text-center text-xs text-muted">
            You’ll be sent to Google to sign in, then brought right back.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Just looking?{' '}
          <Link href="/captions" className="rounded font-medium text-accent hover:underline">
            Browse captions as a guest
          </Link>
        </p>
      </div>
    </main>
  )
}
