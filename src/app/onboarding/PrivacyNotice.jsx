'use client'

export function PrivacyNotice({ onAccept, onSkip }) {
  return (
    <main className="grid min-h-[calc(100vh-88px)] place-items-center bg-cream px-5 py-10 text-ink dark:bg-ink-dark dark:text-cream sm:py-16">
      <section className="w-full max-w-2xl rounded-3xl border border-ink/10 bg-white p-6 shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-coral">Paso 0 · Antes de empezar</p>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl">Sobre tus datos</h1>

        <div className="mt-6 space-y-5 text-sm leading-7 text-ink/70 dark:text-cream/75">
          <p>
            En Sibo.decis queremos ayudarte a organizar tus comidas de forma segura y personalizada.
            A continuación, te pediremos algunos datos personales y de salud para adaptar mejor tu
            experiencia, como filtrar recetas o ajustar tu menú semanal.
          </p>
          <p>
            <strong className="text-ink dark:text-cream">Ningún dato es obligatorio:</strong> podés
            saltear cualquier paso o pregunta y completarlos más adelante desde tu Perfil.
          </p>
          <p>
            <strong className="text-ink dark:text-cream">Uso exclusivo de prueba:</strong> esta
            aplicación se encuentra actualmente en etapa de desarrollo y prueba. La información que
            cargues se utiliza únicamente dentro de la plataforma para personalizar tu menú y
            seguimiento, y no reemplaza el criterio ni el diagnóstico de un profesional de la salud.
          </p>
          <p>
            <strong className="text-ink dark:text-cream">Privacidad:</strong> tus datos están
            asociados únicamente a tu cuenta y podés editarlos o eliminarlos cuando quieras.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onSkip}
            className="order-2 text-sm font-bold text-moss underline-offset-4 transition hover:underline dark:text-sage sm:order-1"
          >
            Saltear por ahora e ir al inicio
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="order-1 rounded-full bg-moss px-6 py-3.5 text-sm font-bold text-white transition hover:bg-moss/90 sm:order-2"
          >
            Entendido, continuar
          </button>
        </div>
      </section>
    </main>
  )
}
