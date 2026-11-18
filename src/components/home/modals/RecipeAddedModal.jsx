import { Check } from '../../ui/icons'

export function RecipeAddedModal({ recipeName, onClose, onGoToMenu }) {
  return (
    <div
      onClick={(event) => event.target === event.currentTarget && onClose()}
      className="fixed inset-0 z-[60] grid place-items-center bg-ink/50 p-4 backdrop-blur-sm"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-added-title"
        className="w-full max-w-md rounded-3xl bg-cream p-6 text-center shadow-2xl dark:bg-ink-soft dark:text-cream sm:p-8"
      >
        <span className="mx-auto inline-flex rounded-full bg-sage p-3 text-moss dark:bg-moss/30 dark:text-sage">
          <Check size={24} />
        </span>
        <h2 id="recipe-added-title" className="mt-4 font-display text-3xl">
          Receta agregada
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/60 dark:text-cream/60">
          <strong className="text-ink dark:text-cream">{recipeName}</strong> se agregó a tu menú semanal.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-ink/15 px-4 py-3 text-sm font-bold text-ink/70 transition hover:bg-white dark:border-cream/15 dark:text-cream/70 dark:hover:bg-ink"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={onGoToMenu}
            className="flex-1 rounded-full bg-moss px-4 py-3 text-sm font-bold text-white transition hover:bg-ink"
          >
            Ir al menú semanal
          </button>
        </div>
      </div>
    </div>
  )
}
