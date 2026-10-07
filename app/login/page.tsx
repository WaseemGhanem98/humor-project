import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchMemes } from '@/lib/memes'
import GoogleSignInButton from '@/components/GoogleSignInButton'
import { LogoMark } from '@/components/Logo'
import { AlertIcon } from '@/components/icons'

export const metadata: Metadata = { title: 'Sign in' }

export default async function LoginPage({
  searchParams,
}: PageProps<'/login'>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/feed')
  }

  const [{ error }, { memes }] = await Promise.all([searchParams, fetchMemes(supabase)])
  const tiles = (memes ?? []).filter((m) => m.imageUrl).slice(0, 4)

  return (
    <main className="mx-auto grid w-full max-w-5xl flex-1 gap-8 px-4 py-10 sm:py-16 lg:grid-cols-2 lg:items-center">
      <section
        aria-hidden
        className="hidden overflow-hidden rounded-[2rem] bg-foreground p-8 text-background lg:block"
      >
        <p className="display text-4xl leading-tight">
          Two buttons.
          <br />
          Strong opinions.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3">
          {tiles.map((meme, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={meme.id}
              src={meme.imageUrl!}
              alt=""
              className={`aspect-[4/3] w-full rounded-2xl object-cover ${i % 2 ? 'translate-y-4' : ''}`}
            />
          ))}
        </div>
      </section>

      <div className="mx-auto w-full max-w-sm">
        <LogoMark className="h-12 w-12" />
        <h1 className="display mt-6 text-4xl">Sign in to vote</h1>
        <p className="mt-2 text-muted">Save your verdicts and keep track of your takes.</p>

        {typeof error === 'string' && (
          <div role="alert" className="alert alert-error mt-6 flex items-start gap-2">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Sign-in didn’t work</p>
              <p className="mt-0.5 break-words">{error}</p>
            </div>
          </div>
        )}

        <div className="mt-8">
          <GoogleSignInButton />
        </div>
        <p className="mt-3 text-xs text-muted">You’ll hop over to Google, then straight back.</p>

        <p className="mt-10 border-t border-border pt-6 text-sm text-muted">
          Just looking?{' '}
          <Link href="/feed" className="rounded font-semibold text-foreground underline-offset-4 hover:underline">
            Browse the feed
          </Link>
        </p>
      </div>
    </main>
  )
}
