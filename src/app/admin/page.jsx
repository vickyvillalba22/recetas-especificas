import Link from 'next/link'

export const metadata = {
  title: 'Administración',
}

export default function AdminPage() {
  return (
    <main className="min-h-[calc(100vh-88px)] bg-cream px-5 py-16 text-ink dark:bg-ink-dark dark:text-cream lg:px-10">
      <section className="mx-auto max-w-[1000px] rounded-3xl border border-ink/10 bg-white p-8 shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark sm:p-12">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-coral">Área administrativa</p>
        <h1 className="mt-3 font-display text-4xl">Panel de administración</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink/60 dark:text-cream/60">Placeholder visual para el futuro panel de usuarios y recetas generales. Los permisos todavía no están implementados.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-ink/10 bg-cream p-5 dark:border-cream/10 dark:bg-ink">
            <h2 className="font-display text-2xl">Usuarios</h2>
            <p className="mt-2 text-sm text-ink/60 dark:text-cream/60">Gestión de cuentas registradas.</p>
          </div>
          <div className="rounded-2xl border border-ink/10 bg-cream p-5 dark:border-cream/10 dark:bg-ink">
            <h2 className="font-display text-2xl">Recetas generales</h2>
            <p className="mt-2 text-sm text-ink/60 dark:text-cream/60">Gestión de la galería pública autenticada.</p>
          </div>
        </div>
        <Link href="/" className="mt-8 inline-flex rounded-full border border-ink/15 px-5 py-3 text-sm font-bold text-ink/75 transition hover:bg-cream dark:border-cream/15 dark:text-cream/80 dark:hover:bg-ink">Volver al inicio</Link>
      </section>
    </main>
  )
}
