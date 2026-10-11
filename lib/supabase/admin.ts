import 'server-only'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Service-role client: bypasses RLS, so only use it in server code after checking the
// user yourself. Used for writes the public API must not allow (saving AI memes) and
// for reading a user's own created_by rows, which anon/authenticated can't select.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set.')
  }
  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
