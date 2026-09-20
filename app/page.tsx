import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data: jokes, error } = await supabase
    .from('jokes')
    .select('id, text')
    .order('id', { ascending: true })

  if (error) {
    return (
      <main>
        <h1>Error</h1>
        <p>{error.message}</p>
      </main>
    )
  }

  return (
    <main>
      <h1>Jokes</h1>

      <ul>
        {jokes?.map((joke) => (
          <li key={joke.id}>{joke.text}</li>
        ))}
      </ul>
    </main>
  )
}