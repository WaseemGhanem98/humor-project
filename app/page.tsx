import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchMemes } from '@/lib/memes'
import JokesList from '@/components/JokesList'
import Logo from '@/components/Logo'
import { ArrowRightIcon, LaughIcon, MehIcon } from '@/components/icons'

const STEPS = [
  { title: 'Scroll', body: 'A feed of memes, one at a time.' },
  { title: 'Call it', body: 'Funny or not funny. One tap.' },
  { title: 'Keep score', body: 'Every verdict is saved to your profile.' },
]

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Signed-in people came for the feed, not the pitch.
  if (user) {
    redirect('/feed')
  }

  const { memes } = await fetchMemes(supabase)
  const withImages = (memes ?? []).filter((m) => m.imageUrl)
  const [front, ...rest] = withImages
  const back = rest.slice(0, 2)

  return (
    <main className="flex-1">
      <section className="mx-auto grid max-w-5xl items-center gap-12 px-4 pt-10 pb-16 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-20">
        <div>
          <h1 className="display text-5xl leading-[0.95] text-balance sm:text-6xl lg:text-7xl">
            What’s actually <span className="mark">funny?</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted text-pretty">
            Scroll a feed of memes and give each one a verdict. Two buttons. No essays.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/feed" className="btn btn-primary btn-lg">
              Open the feed <ArrowRightIcon />
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg">
              Sign in
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted">Free. Browse without an account; sign in with Google to vote.</p>
        </div>

        {front && (
          <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
            {back.map((meme, i) => (
              <div
                key={meme.id}
                aria-hidden
                className={`absolute inset-x-8 top-10 overflow-hidden rounded-3xl border border-border bg-surface shadow-sm ${
                  i === 0 ? '-translate-x-8 -rotate-[8deg] sm:-translate-x-12' : 'translate-x-8 rotate-[7deg] sm:translate-x-12'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={meme.imageUrl!} alt="" className="aspect-[4/3] w-full object-cover opacity-90" />
              </div>
            ))}
            <Link
              href="/feed"
              aria-label={`Open the feed, starting with: ${front.text}`}
              className="relative block overflow-hidden rounded-3xl border border-border bg-surface shadow-[0_20px_60px_-15px_rgb(0_0_0/0.25)] transition-transform duration-300 hover:-translate-y-1 motion-reduce:transform-none"
            >
              <p className="px-5 pt-5 pb-4 font-display text-xl leading-tight font-bold tracking-[-0.02em]">{front.text}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={front.imageUrl!} alt={front.imageAlt ?? ''} className="aspect-[4/3] w-full object-cover" />
              <div aria-hidden className="flex gap-2 p-4">
                <span className="btn btn-vote border-zest bg-zest text-zest-ink">
                  <LaughIcon className="h-5 w-5" /> Funny
                </span>
                <span className="btn btn-vote">
                  <MehIcon className="h-5 w-5" /> Not funny
                </span>
              </div>
            </Link>
          </div>
        )}
      </section>

      <section aria-labelledby="how-heading" className="border-y border-border bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <h2 id="how-heading" className="eyebrow">
            How it works
          </h2>
          <ol className="mt-6 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title}>
                <span className="font-mono text-sm text-muted">0{i + 1}</span>
                <p className="display mt-1 text-2xl">{step.title}</p>
                <p className="mt-1 text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="jokes-heading" className="mx-auto max-w-5xl px-4 py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 id="jokes-heading" className="display text-3xl">
            One-liners
          </h2>
          <p className="text-sm text-muted">No vote needed.</p>
        </div>
        <JokesList />
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="flex flex-col items-start gap-6 rounded-[2rem] bg-foreground px-6 py-12 text-background sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <p className="display max-w-md text-3xl leading-tight sm:text-4xl">Your sense of humor, on the record.</p>
          <Link href="/feed" className="btn btn-zest btn-lg">
            Start scrolling <ArrowRightIcon />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <p>Meme images via Wikimedia Commons, credited on each post.</p>
        </div>
      </footer>
    </main>
  )
}
