import type { createClient } from '@/lib/supabase/server'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

export type Meme = {
  id: number
  text: string
  imageUrl: string | null
  imageAlt: string | null
  imageCredit: string | null
  imageSourceUrl: string | null
}

type CaptionRow = {
  id: number
  text: string
  image_url?: string | null
  image_alt?: string | null
  image_credit?: string | null
  image_source_url?: string | null
}

// Postgres "undefined_column": the meme_images.sql migration hasn't been run yet.
const UNDEFINED_COLUMN = '42703'

// Only render site-relative paths or https URLs, even if the DB check constraint is missing.
function safeUrl(url: string | null | undefined) {
  if (!url) return null
  return /^(\/[^/]|https:\/\/)/.test(url) ? url : null
}

function toMeme(row: CaptionRow): Meme {
  return {
    id: row.id,
    text: row.text,
    imageUrl: safeUrl(row.image_url),
    imageAlt: row.image_alt?.trim() || null,
    imageCredit: row.image_credit?.trim() || null,
    imageSourceUrl: safeUrl(row.image_source_url),
  }
}

export async function fetchMemes(supabase: SupabaseClient) {
  const withImages = await supabase
    .from('captions')
    .select('id, text, image_url, image_alt, image_credit, image_source_url')
    .order('id', { ascending: true })

  if (withImages.error?.code === UNDEFINED_COLUMN) {
    // Fall back to text-only captions so the page still works before the migration.
    const textOnly = await supabase
      .from('captions')
      .select('id, text')
      .order('id', { ascending: true })
    return { memes: textOnly.data?.map(toMeme) ?? null, error: textOnly.error }
  }

  return { memes: withImages.data?.map(toMeme) ?? null, error: withImages.error }
}
