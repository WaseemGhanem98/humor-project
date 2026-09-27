import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isProfileComplete, type Profile } from '@/lib/profile'
import ProfileForm from '@/components/ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, avatar_url, created_at')
    .eq('id', user.id)
    .maybeSingle<Profile>()

  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      <header>
        <p className="eyebrow">Account</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Your profile</h1>
        <p className="mt-1 text-sm break-words text-muted">
          Signed in with Google as {user.email}
        </p>
      </header>

      {error && (
        <p role="alert" className="alert alert-error">
          We couldn’t load your profile: {error.message}
        </p>
      )}
      {!error && !profile && (
        <p role="alert" className="alert alert-error">
          We couldn’t find a profile for your account, so changes may not save.
          Try signing out and back in.
        </p>
      )}

      {!isProfileComplete(profile) && (
        <p className="alert alert-warning">
          <strong>Welcome!</strong> Add your first and last name below to finish
          setting up your profile.
        </p>
      )}

      <ProfileForm
        userId={user.id}
        email={user.email ?? ''}
        initialFirstName={profile?.first_name ?? ''}
        initialLastName={profile?.last_name ?? ''}
        initialAvatarUrl={profile?.avatar_url ?? null}
      />
    </main>
  )
}
