'use client'

export function ConfirmationScreen({ onContinue }) {
  return (
    <main className="grid min-h-screen place-items-center bg-cream px-5 py-10 text-center text-ink dark:bg-ink-dark dark:text-cream sm:py-16">
      <section className="w-full max-w-xl rounded-3xl border border-ink/10 bg-white p-8 shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark sm:p-12">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-moss text-3xl text-white" aria-hidden="true">
          ✓
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-coral">Perfil completado</p>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl">¡Listo!</h1>
        <p className="mt-4 text-sm leading-7 text-ink/65 dark:text-cream/75">
          Registramos todos tus datos. Podés volver a editarlos cuando quieras desde tu perfil.
        </p>
        <button
          type="button"
          onClick={onContinue}
          className="mt-8 rounded-full bg-moss px-6 py-3.5 text-sm font-bold text-white transition hover:bg-moss/90"
        >
          Ir al inicio
        </button>
      </section>
    </main>
  )
}
