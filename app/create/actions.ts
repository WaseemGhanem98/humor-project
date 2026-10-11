'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cleanText, GLOBAL_DAILY, isFlagged, MemeError, PER_USER_DAILY, TOPIC_MAX, TOPIC_MIN, writeMeme } from '@/lib/ai'
import { fetchStock } from '@/lib/stock'
import { MEME_COLUMNS, toMeme, type CaptionRow, type Meme } from '@/lib/memes'

export type CreateResult = { ok: true; meme: Meme } | { ok: false; message: string }

export async function createMeme(rawTopic: string): Promise<CreateResult> {
  const topic = typeof rawTopic === 'string' ? cleanText(rawTopic) : ''
  if (topic.length < TOPIC_MIN) {
    return { ok: false, message: `Give the AI a topic (${TOPIC_MIN}–${TOPIC_MAX} characters).` }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Never trust the UI: re-check the session on the server before spending anything.
  if (!user) {
    return { ok: false, message: 'Please sign in to make a meme.' }
  }

  try {
    const admin = createAdminClient()
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const [mine, everyone, { stock, error: stockError }] = await Promise.all([
      admin
        .from('captions')
        .select('id', { count: 'exact', head: true })
        .eq('created_by', user.id)
        .gte('created_at', since),
      admin
        .from('captions')
        .select('id', { count: 'exact', head: true })
        .eq('source', 'ai')
        .gte('created_at', since),
      fetchStock(supabase),
    ])
    if (mine.error || everyone.error || stockError) {
      throw mine.error ?? everyone.error ?? stockError
    }
    if ((mine.count ?? 0) >= PER_USER_DAILY) {
      return { ok: false, message: `You’ve made ${PER_USER_DAILY} memes today. Come back tomorrow for more.` }
    }
    if ((everyone.count ?? 0) >= GLOBAL_DAILY) {
      return { ok: false, message: 'Wry has hit today’s meme limit. Try again tomorrow.' }
    }
    if (stock.length === 0) {
      throw new Error('The stock image library is empty. Run scripts/seed-stock.mjs.')
    }

    if (await isFlagged([topic])) {
      return { ok: false, message: 'That topic isn’t one we can make a meme about. Try another.' }
    }

    const { caption, image, model } = await writeMeme(topic, stock)

    if (await isFlagged([caption])) {
      return { ok: false, message: 'The AI’s attempt didn’t pass our content check. Try a different topic.' }
    }

    const { data, error } = await admin
      .from('captions')
      .insert({
        text: caption,
        image_url: image.image_url,
        image_alt: image.alt,
        image_credit: image.credit,
        image_source_url: image.source_url,
        source: 'ai',
        ai_model: model,
        prompt: topic,
        created_by: user.id,
        stock_image_id: image.id,
      })
      .select(MEME_COLUMNS)
      .single<CaptionRow>()
    if (error) throw error

    revalidatePath('/feed')
    revalidatePath('/profile')

    return { ok: true, meme: toMeme(data) }
  } catch (err) {
    if (err instanceof MemeError) {
      return { ok: false, message: err.message }
    }
    console.error('createMeme failed', err)
    return { ok: false, message: 'The AI couldn’t make that one right now. Try again in a moment.' }
  }
}
