import type { SupabaseClient as AnyClient } from '@supabase/supabase-js'
import type { createClient } from '@/lib/supabase/server'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

export type Meme = {
  id: number
  text: string
  imageUrl: string | null
  imageAlt: string | null
  imageCredit: string | null
  imageSourceUrl: string | null
  isAi: boolean
  prompt: string | null
}

export type CaptionRow = {
  id: number
  text: string
  image_url?: string | null
  image_alt?: string | null
  image_credit?: string | null
  image_source_url?: string | null
  source?: string | null
  prompt?: string | null
}

export const MEME_COLUMNS = 'id, text, image_url, image_alt, image_credit, image_source_url, source, prompt'

// Postgres "undefined_column": a migration (meme_images.sql / ai_memes.sql) hasn't been run yet.
const UNDEFINED_COLUMN = '42703'

// Only render site-relative paths or https URLs, even if the DB check constraint is missing.
function safeUrl(url: string | null | undefined) {
  if (!url) return null
  return /^(\/[^/]|https:\/\/)/.test(url) ? url : null
}

export function toMeme(row: CaptionRow): Meme {
  return {
    id: row.id,
    text: row.text,
    imageUrl: safeUrl(row.image_url),
    imageAlt: row.image_alt?.trim() || null,
    imageCredit: row.image_credit?.trim() || null,
    imageSourceUrl: safeUrl(row.image_source_url),
    isAi: row.source === 'ai',
    prompt: row.prompt?.trim() || null,
  }
}

// Newest first, so fresh AI memes lead the feed.
export async function fetchMemes(supabase: SupabaseClient) {
  const withImages = await supabase
    .from('captions')
    .select(MEME_COLUMNS)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })

  if (withImages.error?.code === UNDEFINED_COLUMN) {
    // Fall back to text-only captions so the page still works before the migration.
    const textOnly = await supabase
      .from('captions')
      .select('id, text')
      .order('id', { ascending: false })
    return { memes: textOnly.data?.map(toMeme) ?? null, error: textOnly.error }
  }

  return { memes: withImages.data?.map(toMeme) ?? null, error: withImages.error }
}

// Memes a user prompted. created_by isn't readable through the public API, so this
// takes the service-role client and must only be called with the signed-in user's id.
export async function fetchMemesBy(admin: AnyClient, userId: string) {
  const { data, error } = await admin
    .from('captions')
    .select(MEME_COLUMNS)
    .eq('created_by', userId)
    .order('created_at', { ascending: false })
    .returns<CaptionRow[]>()
  return { memes: data?.map(toMeme) ?? [], error }
}
