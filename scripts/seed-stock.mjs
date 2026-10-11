// Uploads the stock images in supabase/stock/ to the public "stock" bucket and upserts
// one stock_images row per manifest entry. Run once after supabase/ai_memes.sql:
//
//   node --env-file=.env --env-file=.env.local scripts/seed-stock.mjs
//
// Needs SUPABASE_SERVICE_ROLE_KEY (server-only, never NEXT_PUBLIC_). Safe to re-run.
import { readFile } from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })
const dir = new URL('../supabase/stock/', import.meta.url)
const manifest = JSON.parse(await readFile(new URL('manifest.json', dir), 'utf8'))

for (const item of manifest) {
  const body = await readFile(new URL(item.file, dir))
  const { error: uploadError } = await supabase.storage
    .from('stock')
    .upload(item.file, body, { contentType: 'image/jpeg', upsert: true, cacheControl: '31536000' })
  if (uploadError) throw new Error(`${item.file}: ${uploadError.message}`)

  const { data } = supabase.storage.from('stock').getPublicUrl(item.file)
  const { error } = await supabase.from('stock_images').upsert(
    {
      slug: item.slug,
      image_url: data.publicUrl,
      alt: item.alt,
      description: item.description,
      tags: item.tags,
      credit: item.credit,
      source_url: item.source_url,
    },
    { onConflict: 'slug' }
  )
  if (error) throw new Error(`${item.slug}: ${error.message}`)
  console.log(`✓ ${item.slug}`)
}

console.log(`Seeded ${manifest.length} stock images.`)
