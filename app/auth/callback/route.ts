import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isProfileComplete } from '@/lib/profile'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    const oauthError = searchParams.get('error_description') ?? 'Missing auth code'
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(oauthError)}`
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error?.message ?? 'Login failed')}`
    )
  }

  // First login (or names still missing): send the user to finish their profile.
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', data.user.id)
    .maybeSingle()

  const next = isProfileComplete(profile) ? '/dashboard' : '/profile'
  return NextResponse.redirect(`${origin}${next}`)
}
