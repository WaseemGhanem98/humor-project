import { createClient } from '@/lib/supabase/server'

export default async function JokesList() {
  const supabase = await createClient()
  const { data: jokes, error } = await supabase
    .from('jokes')
    .select('id, text')
    .order('id', { ascending: true })

  if (error) {
    return (
      <p className="alert alert-error">Error loading jokes: {error.message}</p>
    )
  }

  if (!jokes?.length) {
    return <p className="card text-center text-muted">No jokes yet.</p>
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {jokes.map((joke, index) => (
        <li key={joke.id} className="card flex gap-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
            {index + 1}
          </span>
          <p className="leading-relaxed">{joke.text}</p>
        </li>
      ))}
    </ul>
  )
}
