// Pure helpers for turning model output into a safe meme. No server-only imports, so
// they can be unit-tested directly (see scripts/test-meme-output.mts).

export const TOPIC_MIN = 3
export const TOPIC_MAX = 80
export const CAPTION_MAX = 140

export class MemeError extends Error {}

type StockLike = { id: number }

// Topics and captions are stored and shown publicly, so normalize them first:
// no control/zero-width characters, no angle brackets, single spaces, length-capped.
export function cleanText(raw: string, max = TOPIC_MAX) {
  return raw
    .normalize('NFKC')
    .replace(/[\p{Cc}\p{Cf}<>]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

// Validates the model's JSON. Unknown image ids fall back to an image that wasn't
// used recently, so a bad id never breaks the meme or repeats the same photo.
export function parseMemeOutput<T extends StockLike>(text: string, stock: T[], recentIds: number[] = []) {
  if (stock.length === 0) throw new Error('Stock library is empty.')

  let out: unknown
  try {
    out = JSON.parse(text)
  } catch {
    throw new Error('Model returned invalid JSON.')
  }
  const { caption, image_id, refused } = (out ?? {}) as Record<string, unknown>
  if (refused === true) throw new MemeError('The AI passed on that one. Try a different topic.')
  if (typeof caption !== 'string') throw new Error('Model returned no caption.')

  // Strip quotes only when they wrap the whole caption; a quote inside the joke stays.
  const unwrapped = caption.trim().replace(/^["“]([^"“”]*)["”]$/, '$1')
  const text_ = cleanText(unwrapped, CAPTION_MAX)
  if (text_.length < 3) throw new Error('Model returned an empty caption.')

  const fresh = stock.filter((s) => !recentIds.includes(s.id))
  const image =
    stock.find((s) => s.id === image_id) ?? (fresh.length ? fresh : stock)[Math.floor(Math.random() * (fresh.length || stock.length))]

  return { caption: text_, image }
}
