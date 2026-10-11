'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cleanText, isFlagged, MemeError, PER_USER_DAILY, TOPIC_MAX, TOPIC_MIN, writeMeme } from '@/lib/ai'
import { fetchQuota } from '@/lib/quota'
import { fetchStock } from '@/lib/stock'
import { MEME_COLUMNS, toMeme, type CaptionRow, type Meme } from '@/lib/memes'

export type CreateResult =
  | { ok: true; meme: Meme; left: number }
  | { ok: false; message: string; left?: number }

const LIMIT_MESSAGE = `That’s your ${PER_USER_DAILY} for today. Come back tomorrow.`

export async function createMeme(rawTopic: string): Promise<CreateResult> {
  const topic = typeof rawTopic === 'string' ? cleanText(rawTopic) : ''
  if (topic.length < TOPIC_MIN) {
    return { ok: false, message: `Give it a bit more to work with (${TOPIC_MIN}–${TOPIC_MAX} characters).` }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Never trust the UI: re-check the session on the server before spending anything.
  if (!user) {
    return { ok: false, message: 'Your session ended. Sign in again to make memes.' }
  }

  try {
    const admin = createAdminClient()
    const [quota, { stock, error: stockError }, recent] = await Promise.all([
      fetchQuota(admin, user.id),
      fetchStock(supabase),
      // Recently used photos, so the AI spreads its picks across the library.
      admin.from('captions').select('stock_image_id').eq('source', 'ai').order('created_at', { ascending: false }).limit(6),
    ])
    if (stockError || recent.error) throw stockError ?? recent.error
    if (quota.left === 0) return { ok: false, message: LIMIT_MESSAGE, left: 0 }
    if (quota.appFull) return { ok: false, message: 'Wry hit today’s limit. Try again tomorrow.', left: quota.left }
    if (stock.length === 0) throw new Error('The stock image library is empty. Run scripts/seed-stock.mjs.')

    if (await isFlagged([topic])) {
      return { ok: false, message: 'We can’t make a meme about that. Try another topic.', left: quota.left }
    }

    const recentIds = [...new Set((recent.data ?? []).map((r) => r.stock_image_id).filter((id): id is number => id != null))]
    const { caption, image, model } = await writeMeme(topic, stock, recentIds)

    if (await isFlagged([caption])) {
      return { ok: false, message: 'The AI’s attempt didn’t pass our filter. Try a different topic.', left: quota.left }
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

    return { ok: true, meme: toMeme(data), left: quota.left - 1 }
  } catch (err) {
    if (err instanceof MemeError) {
      return { ok: false, message: err.message }
    }
    // Details stay in the server log; the user gets a plain retry message.
    console.error('createMeme failed:', err instanceof Error ? err.message : err)
    return { ok: false, message: 'The AI froze up. Give it another go in a moment.' }
  }
}
