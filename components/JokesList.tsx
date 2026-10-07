import { createClient } from '@/lib/supabase/server'

export default async function JokesList() {
  const supabase = await createClient()
  const { data: jokes, error } = await supabase
    .from('jokes')
    .select('id, text')
    .order('id', { ascending: true })

  if (error) {
    return (
      <p role="alert" className="alert alert-error">
        The one-liners didn’t load. Try again in a moment.
      </p>
    )
  }

  if (!jokes?.length) {
    return <p className="card text-center text-muted">No one-liners yet.</p>
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {jokes.map((joke) => (
        <li key={joke.id} className="card flex gap-4">
          <span aria-hidden className="display text-4xl leading-none text-muted/40">
            “
          </span>
          <p className="text-lg leading-relaxed text-pretty">{joke.text}</p>
        </li>
      ))}
    </ul>
  )
}
