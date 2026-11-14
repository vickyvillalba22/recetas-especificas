import { Star, X } from '../ui/icons'

export function RemoveFavoriteModal({ recipe, onClose, onConfirm, loading, error }) {
  return (
    <div onClick={(event) => event.target === event.currentTarget && !loading && onClose()} className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="remove-favorite-title" className="w-full max-w-sm rounded-3xl bg-cream p-6 shadow-2xl dark:bg-ink-soft dark:text-cream sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex rounded-full bg-sun/20 p-3 text-sun">
            <Star size={20} className="fill-current" />
          </span>
          <button onClick={onClose} disabled={loading} type="button" className="rounded-full p-2 text-ink/50 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:text-cream/50 dark:hover:bg-ink" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <h2 id="remove-favorite-title" className="mt-4 font-display text-2xl">¿Eliminar de favoritos?</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/60 dark:text-cream/60">
          ¿Estás seguro de que querés eliminar <strong className="text-ink dark:text-cream">{recipe.name}</strong> de tus favoritos?
        </p>
        {error && <p className="mt-4 rounded-xl bg-coral/10 p-3 text-sm text-coral">{error}</p>}
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} disabled={loading} type="button" className="flex-1 rounded-full border border-ink/15 px-4 py-3 text-sm font-bold text-ink/70 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-cream/15 dark:text-cream/70 dark:hover:bg-ink">Cancelar</button>
          <button onClick={onConfirm} disabled={loading} type="button" className="flex-1 rounded-full bg-coral px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Eliminando...' : 'Eliminar'}</button>
        </div>
      </div>
    </div>
  )
}
