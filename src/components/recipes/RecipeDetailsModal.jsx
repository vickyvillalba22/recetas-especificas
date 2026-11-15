import { BookHeart, CirclePlus, Clock3, Star, X } from '../ui/icons'

function list(values) {
  return Array.isArray(values) ? values : []
}

export function RecipeDetailsModal({ recipe, onClose, onAddToMenu, onToggleFavorite, isFavorite, favoriteLoading, favoriteSaving }) {
  if (!recipe) return null

  return (
    <div onClick={(event) => event.target === event.currentTarget && onClose()} className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="recipe-details-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-cream p-6 shadow-2xl dark:bg-ink-soft dark:text-cream sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex rounded-full bg-sage p-3 text-moss dark:bg-moss/30 dark:text-sage">
              <BookHeart size={20} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-coral">Receta general</p>
              <h2 id="recipe-details-title" className="font-display text-3xl">{recipe.name}</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-ink/50 transition hover:bg-white dark:text-cream/50 dark:hover:bg-ink" aria-label="Cerrar detalles">
            <X size={20} />
          </button>
        </div>

        {recipe.imageUrl ? (
          <img src={recipe.imageUrl} alt={recipe.name} className="mt-6 h-56 w-full rounded-2xl object-cover sm:h-72" loading="lazy" />
        ) : (
          <div className="mt-6 grid h-40 place-items-center rounded-2xl bg-sage/60 text-moss dark:bg-moss/25 dark:text-sage">
            <BookHeart size={42} />
          </div>
        )}

        {recipe.description && <p className="mt-6 text-sm leading-relaxed text-ink/65 dark:text-cream/65">{recipe.description}</p>}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {recipe.time && <span className="inline-flex items-center gap-1.5 rounded-full bg-coral/10 px-3 py-1.5 text-xs font-bold text-coral"><Clock3 size={14} /> {recipe.time}</span>}
          {list(recipe.tags).map((tag) => <span key={tag} className="rounded-full bg-sage px-3 py-1.5 text-xs font-bold text-moss dark:bg-moss/30 dark:text-sage">{tag}</span>)}
        </div>

        <div className="mt-7 grid gap-6 md:grid-cols-2">
          <section>
            <h3 className="font-display text-2xl text-moss dark:text-sage">Ingredientes</h3>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink/70 dark:text-cream/70">
              {list(recipe.ingredients).map((ingredient) => <li key={ingredient} className="rounded-xl bg-white px-3 py-2 dark:bg-ink">{ingredient}</li>)}
            </ul>
          </section>
          <section>
            <h3 className="font-display text-2xl text-moss dark:text-sage">Preparación</h3>
            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-ink/70 dark:text-cream/70">
              {list(recipe.steps).map((step, index) => <li key={step} className="flex gap-3 rounded-xl bg-white px-3 py-2 dark:bg-ink"><span className="font-bold text-coral">{index + 1}.</span><span>{step}</span></li>)}
            </ol>
          </section>
        </div>

        <div className="mt-8 flex justify-end gap-2 border-t border-ink/10 pt-5 dark:border-cream/10">
          {onAddToMenu && (
            <button
              type="button"
              onClick={() => onAddToMenu(recipe)}
              className="grid h-10 w-10 place-items-center rounded-full bg-moss text-white transition hover:bg-ink"
              title="Agregar al menú"
              aria-label={`Agregar ${recipe.name} al menú`}
            >
              <CirclePlus size={19} />
            </button>
          )}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(recipe)}
              disabled={favoriteLoading || favoriteSaving}
              className={`grid h-10 w-10 place-items-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${isFavorite ? 'bg-sun/20 text-sun' : 'border border-moss/25 text-moss hover:bg-sage dark:border-sage/20 dark:text-sage dark:hover:bg-moss/30'}`}
              title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              aria-label={isFavorite ? `Quitar ${recipe.name} de favoritos` : `Agregar ${recipe.name} a favoritos`}
              aria-pressed={isFavorite}
            >
              <Star size={19} className={isFavorite ? 'fill-current' : ''} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
