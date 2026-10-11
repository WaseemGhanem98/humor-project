import type { Meme } from '@/lib/memes'
import { SparkleIcon } from '@/components/icons'

// Shared by server pages and the client MemeCard, so it must stay free of client-only code.
export const plateNumber = (id: number) => `No. ${String(id).padStart(3, '0')}`

// "AI-written" or "Original": the one label every meme carries.
export function MemeSource({ meme }: { meme: Meme }) {
  return meme.isAi ? (
    <span className="meta inline-flex items-center gap-1.5 bg-zest px-1.5 py-0.5 text-zest-ink">
      <SparkleIcon className="h-3 w-3" /> AI-written
    </span>
  ) : (
    <span className="meta border border-border px-1.5 py-0.5 text-muted">Original</span>
  )
}
