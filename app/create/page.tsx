import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { MEME_MODEL, PER_USER_DAILY, TOPIC_MAX, TOPIC_MIN } from '@/lib/ai'
import { fetchQuota } from '@/lib/quota'
import CreateMeme from '@/components/CreateMeme'

export const metadata: Metadata = { title: 'Make an AI meme' }

async function memesLeft(userId: string) {
  try {
    return (await fetchQuota(createAdminClient(), userId)).left
  } catch {
    // If the count fails, let the server action enforce the limit on submit.
    return PER_USER_DAILY
  }
}

export default async function CreatePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const left = await memesLeft(user.id)

  return (
    <main id="main" className="mx-auto w-full max-w-[38rem] px-4 pt-10 pb-16 sm:pt-14">
      <header className="mb-10 border-b border-rule pb-6">
        <p className="eyebrow">The desk · AI-written memes</p>
        <h1 className="display mt-3 text-[3.4rem] leading-[0.95] sm:text-7xl">
          Make the AI <span className="mark">try.</span>
        </h1>
        <p className="mt-5 text-muted text-pretty">
          You give it a topic. It writes the joke and picks the photo. The feed decides if it’s funny.
        </p>
      </header>

      <CreateMeme topicMin={TOPIC_MIN} topicMax={TOPIC_MAX} dailyLimit={PER_USER_DAILY} initialLeft={left} />

      <p className="mt-12 border-t border-border pt-4 text-xs leading-relaxed text-muted">
        Written by <span className="font-mono">{MEME_MODEL}</span>. Topics and jokes go through a content filter before
        anything is posted. Your topic appears on the meme; your name doesn’t.
      </p>
    </main>
  )
}
