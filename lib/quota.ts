import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { GLOBAL_DAILY, PER_USER_DAILY } from '@/lib/ai'

// How many AI memes this user (and the whole app) can still make in the rolling 24h window.
// Takes the service-role client: created_by isn't readable through the public API.
export async function fetchQuota(admin: SupabaseClient, userId: string) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const [mine, everyone] = await Promise.all([
    admin.from('captions').select('id', { count: 'exact', head: true }).eq('created_by', userId).gte('created_at', since),
    admin.from('captions').select('id', { count: 'exact', head: true }).eq('source', 'ai').gte('created_at', since),
  ])
  if (mine.error || everyone.error) throw mine.error ?? everyone.error

  return {
    left: Math.max(PER_USER_DAILY - (mine.count ?? 0), 0),
    appFull: (everyone.count ?? 0) >= GLOBAL_DAILY,
  }
}
