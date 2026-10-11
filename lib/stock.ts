import type { SupabaseClient } from '@supabase/supabase-js'

export type StockImage = {
  id: number
  image_url: string
  alt: string
  description: string
  tags: string[]
  credit: string | null
  source_url: string | null
}

// The stock library the AI picks images from (public read, managed with scripts/seed-stock.mjs).
export async function fetchStock(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('stock_images')
    .select('id, image_url, alt, description, tags, credit, source_url')
    .eq('active', true)
    .order('id', { ascending: true })
    .returns<StockImage[]>()
  return { stock: data ?? [], error }
}
