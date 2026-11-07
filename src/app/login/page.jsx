import Link from 'next/link'

export const metadata = {
  title: 'Iniciar sesión',
}

export default function LoginPage() {
  return (
    <main className="grid min-h-[calc(100vh-88px)] place-items-center bg-cream px-5 py-16 text-ink dark:bg-ink-dark dark:text-cream">
      <section className="w-full max-w-md rounded-3xl border border-ink/10 bg-white p-8 shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-coral">Acceso</p>
        <h1 className="mt-3 font-display text-3xl">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-ink/60 dark:text-cream/60">Esta pantalla es un placeholder. La autenticación se conectará en la etapa de Firebase.</p>
        <form className="mt-7 space-y-4">
          <label className="block text-sm font-bold">Email<input className="field mt-2" type="email" placeholder="tu@email.com" /></label>
          <label className="block text-sm font-bold">Contraseña<input className="field mt-2" type="password" placeholder="••••••••" /></label>
          <button type="button" className="w-full rounded-full bg-moss py-3.5 text-sm font-bold text-white">Ingresar</button>
        </form>
        <div className="mt-6 flex flex-col gap-2 text-center text-sm">
          <Link className="font-semibold text-moss dark:text-sage" href="/registro">¿No tienes cuenta? Regístrate</Link>
          <Link className="text-ink/50 hover:text-ink dark:text-cream/50 dark:hover:text-cream" href="/bienvenida">Volver a bienvenida</Link>
        </div>
      </section>
    </main>
  )
}
