import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchMemes } from '@/lib/memes'
import { MemeSource, plateNumber } from '@/components/MemeSource'
import Logo from '@/components/Logo'
import { ArrowRightIcon, LaughIcon, MehIcon, SparkleIcon } from '@/components/icons'

const STEPS = [
  { title: 'Prompt it.', body: 'Give the AI a topic. It writes the joke and picks the photo.' },
  { title: 'Judge it.', body: 'Funny or Not funny. One tap, every meme.' },
  { title: 'Keep score.', body: 'Your takes and your hit rate, on the record.' },
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
  const cover = (memes ?? []).find((m) => m.imageUrl && m.isAi) ?? (memes ?? []).find((m) => m.imageUrl)
  const headlines = (memes ?? []).filter((m) => m.isAi).slice(0, 10)

  return (
    <main id="main" className="flex-1">
      {/* Cover */}
      <section className="mx-auto max-w-6xl px-4 pt-8 pb-14 sm:px-6 sm:pt-10 lg:pb-20">
        <div className="flex items-center justify-between border-b border-rule pb-3">
          <p className="eyebrow">The AI humor review</p>
          <p className="eyebrow hidden sm:block">Free · No essays</p>
        </div>

        <div className="mt-8 grid items-center gap-12 lg:mt-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div>
            <h1 className="display text-[5.2rem] leading-[0.82] tracking-[-0.03em] sm:text-[8rem] lg:text-[9.5rem]">
              Is it <span className="mark">funny?</span>
            </h1>
            <p className="mt-8 max-w-md text-lg text-pretty text-muted">
              AI writes the memes. You decide if they land. Two buttons, no essays, and a running score of your taste.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/feed" className="btn btn-primary btn-lg">
                Open the feed <ArrowRightIcon />
              </Link>
              <Link href="/login" className="btn btn-secondary btn-lg">
                Sign in
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted">Browse without an account. Sign in with Google to judge and make your own.</p>
          </div>

          {cover && (
            <Link
              href="/feed"
              aria-label={`Open the feed, starting with: ${cover.text}`}
              className="plate mx-auto block w-full max-w-md shadow-[10px_10px_0_var(--rule)] transition-[transform,box-shadow] duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[12px_12px_0_var(--rule)] motion-reduce:transform-none"
            >
              <span className="flex items-center justify-between border-b border-rule px-4 py-2.5">
                <span className="meta text-muted">{plateNumber(cover.id)} · On the cover</span>
                <MemeSource meme={cover} />
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover.imageUrl!} alt={cover.imageAlt ?? ''} fetchPriority="high" className="aspect-[4/3] w-full object-cover" />
              <span className="display block border-t border-rule px-5 pt-5 pb-6 text-3xl leading-[1.08]">{cover.text}</span>
              <span aria-hidden className="grid grid-cols-2 border-t border-rule">
                <span className="flex h-14 items-center justify-center gap-2 border-r border-rule bg-zest font-semibold text-zest-ink">
                  <LaughIcon className="h-5 w-5" /> Funny
                </span>
                <span className="flex h-14 items-center justify-center gap-2 font-semibold">
                  <MehIcon className="h-5 w-5" /> Not funny
                </span>
              </span>
            </Link>
          )}
        </div>
      </section>

      {/* Ticker: the latest AI-written jokes, scrolling like a news crawl. */}
      {headlines.length > 2 && (
        <section aria-label="Latest AI-written jokes" className="overflow-hidden border-y border-rule bg-foreground py-3.5 text-background">
          <ul className="sr-only">
            {headlines.map((m) => (
              <li key={m.id}>{m.text}</li>
            ))}
          </ul>
          <div aria-hidden className="animate-ticker flex w-max">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center">
                {headlines.map((m) => (
                  <span key={`${copy}-${m.id}`} className="flex items-center">
                    <span className="display px-6 text-xl whitespace-nowrap italic">{m.text}</span>
                    <SparkleIcon className="h-4 w-4 shrink-0 text-zest" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section aria-labelledby="how-heading" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 id="how-heading" className="eyebrow border-b border-rule pb-3">
          How it works
        </h2>
        <ol className="grid sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className={`border-b border-border py-8 sm:border-b-0 sm:py-10 sm:pr-8 ${i > 0 ? 'sm:border-l sm:border-rule sm:pl-8' : ''}`}>
              <span className="display text-7xl leading-none italic">{i + 1}</span>
              <p className="display mt-4 text-4xl leading-none">{step.title}</p>
              <p className="mt-3 max-w-[16rem] text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Sign-off */}
      <section className="border-t border-rule">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:py-20">
          <p className="display max-w-2xl text-6xl leading-[0.9] sm:text-7xl">
            Your sense of humor, <span className="mark">on the record.</span>
          </p>
          <Link href="/feed" className="btn btn-zest btn-lg border border-rule">
            Open the feed <ArrowRightIcon />
          </Link>
        </div>
      </section>

      <footer className="border-t border-rule">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo />
          <p className="text-xs text-muted">AI-written memes are labelled. Photos via Wikimedia Commons, credited on every post.</p>
        </div>
      </footer>
    </main>
  )
}
