export default function NotFound() {
  return (
    <main className="grid min-h-[calc(100vh-88px)] place-items-center bg-cream px-5 py-16 text-center text-ink dark:bg-ink-dark dark:text-cream">
      <section>
        <p className="text-sm font-bold uppercase tracking-[.2em] text-coral">404</p>
        <h1 className="mt-3 font-display text-4xl">Página no encontrada</h1>
        <p className="mt-3 text-sm text-ink/60 dark:text-cream/60">La dirección que buscas no existe.</p>
      </section>
    </main>
  )
}
