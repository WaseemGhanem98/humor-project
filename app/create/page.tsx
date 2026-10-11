import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MEME_MODEL, PER_USER_DAILY, TOPIC_MAX, TOPIC_MIN } from '@/lib/ai'
import CreateMeme from '@/components/CreateMeme'

export const metadata: Metadata = { title: 'Make an AI meme' }

const STEPS = [
  'You give it a topic.',
  'An AI model writes the caption and picks a photo from our stock library.',
  'It lands in the feed, and everyone votes: funny or not.',
]

export default async function CreatePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 pt-8 pb-12 sm:pt-12">
      <header className="mb-6">
        <p className="eyebrow">AI-generated memes</p>
        <h1 className="display mt-2 text-4xl sm:text-5xl">
          Make the AI <span className="mark">try.</span>
        </h1>
        <ol className="mt-4 space-y-1.5 text-muted">
          {STEPS.map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="font-mono text-sm leading-6">0{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </header>

      <CreateMeme topicMin={TOPIC_MIN} topicMax={TOPIC_MAX} />

      <p className="mt-6 text-xs text-muted">
        Captions are written by <span className="font-mono">{MEME_MODEL}</span>. Topics and captions are checked by a
        content filter before anything is saved, and your topic is shown on the meme. Up to {PER_USER_DAILY} memes per person per day.
      </p>
    </main>
  )
}
