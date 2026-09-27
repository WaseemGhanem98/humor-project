import { signOut } from '@/app/auth/actions'
import { LogOutIcon } from '@/components/icons'

// `compact` hides the text on small screens (icon-only, still labelled).
export default function SignOutButton({ compact = false }: { compact?: boolean }) {
  return (
    <form action={signOut}>
      <button
        type="submit"
        aria-label={compact ? 'Log out' : undefined}
        className="btn btn-ghost px-3"
      >
        <LogOutIcon />
        <span className={compact ? 'hidden sm:inline' : undefined}>Log out</span>
      </button>
    </form>
  )
}
