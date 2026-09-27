import JokesList from '@/components/JokesList'

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Jokes</h1>
        <p className="mt-1 text-muted">Fresh from the Supabase jokes table.</p>
      </header>
      <JokesList />
    </main>
  )
}
