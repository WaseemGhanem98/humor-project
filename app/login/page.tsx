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
    <main id="main" className="mx-auto grid w-full max-w-6xl flex-1 gap-10 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
      <section aria-hidden className="hidden border border-rule bg-foreground p-8 text-background lg:block">
        <p className="meta text-background/60">The AI humor review</p>
        <p className="display mt-4 text-6xl leading-[0.9]">
          Two buttons.
          <br />
          <span className="italic">Strong opinions.</span>
        </p>
        <div className="mt-8 grid grid-cols-2 gap-px border border-background/20 bg-background/20">
          {tiles.map((meme) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={meme.id} src={meme.imageUrl!} alt="" className="aspect-[4/3] w-full object-cover" />
          ))}
        </div>
      </section>

      <div className="mx-auto w-full max-w-sm">
        <LogoMark className="h-12 w-12" />
        <p className="eyebrow mt-8">Members only, free forever</p>
        <h1 className="display mt-2 text-6xl leading-[0.9]">
          Sign in <span className="mark">to play.</span>
        </h1>
        <p className="mt-4 text-muted">Judge AI memes, make your own, keep score.</p>

        {typeof error === 'string' && (
          <div role="alert" className="alert alert-error mt-6 flex items-start gap-2">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
            {/* The raw reason stays out of the UI: the query string is user-controllable. */}
            <div>
              <p className="font-semibold">Sign-in didn’t work</p>
              <p className="mt-0.5">Give it another try. If it keeps happening, try a different Google account.</p>
            </div>
          </div>
        )}

        <div className="mt-8">
          <GoogleSignInButton />
        </div>
        <p className="mt-3 text-xs text-muted">You’ll hop over to Google, then straight back.</p>

        <p className="mt-10 border-t border-rule pt-5 text-sm text-muted">
          Just looking?{' '}
          <Link href="/feed" className="link font-semibold text-foreground">
            Browse the feed
          </Link>
        </p>
      </div>
    </main>
  )
}
