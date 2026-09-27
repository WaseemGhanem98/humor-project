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
        We couldn’t load the jokes right now. Please try again in a moment.
      </p>
    )
  }

  if (!jokes?.length) {
    return <p className="card text-center text-muted">No jokes yet. Check back soon!</p>
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {jokes.map((joke) => (
        <li key={joke.id} className="card relative overflow-hidden">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-3 right-4 font-serif text-8xl leading-none text-accent/10 select-none"
          >
            ”
          </span>
          <p className="relative text-lg leading-relaxed">{joke.text}</p>
        </li>
      ))}
    </ul>
  )
}
