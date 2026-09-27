import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GoogleSignInButton from '@/components/GoogleSignInButton'

export default async function LoginPage({
  searchParams,
}: PageProps<'/login'>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  const { error } = await searchParams

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="card w-full max-w-sm p-8 text-center">
        <div className="mb-4 text-4xl">😂</div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mb-6 mt-2 text-sm text-muted">
          Sign in to see your dashboard and manage your profile.
        </p>
        {typeof error === 'string' && (
          <p className="alert alert-error mb-4 text-left">{error}</p>
        )}
        <GoogleSignInButton />
      </div>
    </main>
  )
}
