import Link from 'next/link'

export const metadata = {
  title: 'Bienvenida',
}

export default function WelcomePage() {
  return (
    <main className="home-page-background grid min-h-[calc(100vh-88px)] place-items-center bg-cream px-5 py-16 text-ink dark:bg-ink-dark dark:text-cream">
      <section className="w-full max-w-xl rounded-3xl border border-ink/10 bg-white p-8 text-center shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark sm:p-12">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-coral">sibo.decis</p>
        <h1 className="mt-4 font-display text-4xl">Bienvenido!</h1>
        <p className="mx-auto mt-4 max-w-md text-md leading-relaxed text-ink/60 dark:text-cream/60">Organiza tus comidas, recetas, lista de compras y diario personal en un solo lugar.</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link href="/login" className="rounded-full bg-moss px-5 py-3 text-sm font-bold text-white transition hover:bg-ink">Iniciar sesión</Link>
          <Link href="/registro" className="rounded-full border border-ink/15 px-5 py-3 text-sm font-bold text-ink/75 transition hover:bg-cream dark:border-cream/15 dark:text-cream/80 dark:hover:bg-ink">Crear cuenta</Link>
        </div>
      </section>
    </main>
  )
}
