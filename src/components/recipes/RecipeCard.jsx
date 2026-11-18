import { BookHeart, CirclePlus, Clock3, Info, Sparkles, Star, X } from '../ui/icons'

export function RecipeCard({
  recipe,
  isPublic,
  isFavorites,
  canManage,
  onAddToMenu,
  onViewDetails,
  onToggleFavorite,
  favoriteRecipeIds,
  favoriteLoading,
  favoriteSavingId,
  onDeleteRecipe,
  onEditRecipe,
}) {
  const usesMediaLayout = isFavorites || (isPublic && recipe.imageUrl)
  const isAiRecipe = recipe.origin === 'gemini'
  const canFavorite = (isPublic || isFavorites) && onToggleFavorite
  const isFavorite = favoriteRecipeIds.has(recipe.id)

  function renderFavoriteButton(overlay = false) {
    if (!canFavorite) return null

    return (
      <button
        type="button"
        onClick={() => onToggleFavorite(recipe)}
        disabled={favoriteLoading || favoriteSavingId === recipe.id}
        className={overlay
          ? `absolute left-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:bg-white dark:bg-ink/85 dark:hover:bg-ink ${isFavorite ? 'text-sun' : 'text-ink/45 hover:text-sun dark:text-cream/60'}`
          : `grid h-9 w-9 place-items-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${isFavorite ? 'bg-sun/20 text-sun' : 'text-ink/35 hover:bg-sun/10 hover:text-sun dark:text-cream/40'}`}
        aria-label={isFavorite ? `Quitar ${recipe.name} de favoritos` : `Agregar ${recipe.name} a favoritos`}
        aria-pressed={isFavorite}
      >
        <Star size={18} className={isFavorite ? 'fill-current' : ''} />
      </button>
    )
  }

  return (
    <article
      className={`flex min-h-72 rounded-2xl border border-ink/10 bg-cream dark:border-cream/10 dark:bg-ink ${usesMediaLayout ? 'flex-row gap-3 p-3' : 'flex-col p-5'}`}
    >
      {usesMediaLayout && (
        <div className="relative h-full w-[38%] shrink-0 overflow-hidden rounded-xl">
          {recipe.imageUrl ? (
            <img src={recipe.imageUrl} alt={recipe.name} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="grid h-full w-full place-items-center bg-sage/60 text-moss dark:bg-moss/25 dark:text-sage">
              {isAiRecipe ? <Sparkles size={42} /> : <BookHeart size={42} />}
            </div>
          )}
          {renderFavoriteButton(true)}
        </div>
      )}
      <div className={`flex min-w-0 flex-1 flex-col ${usesMediaLayout ? 'p-2' : ''}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-[18px] text-moss dark:text-sage">{recipe.name}</h3>
            {recipe.time && (
              <p className="mt-2 flex items-center gap-1 text-xs font-bold text-coral">
                <Clock3 size={13} /> {recipe.time}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {!usesMediaLayout && renderFavoriteButton()}
            {canManage && onDeleteRecipe && (
              <button
                type="button"
                onClick={() => onDeleteRecipe(recipe)}
                className="rounded-full p-2 text-ink/40 transition hover:bg-coral/10 hover:text-coral dark:text-cream/40"
                aria-label={`Eliminar ${recipe.name}`}
              >
                <X size={17} />
              </button>
            )}
          </div>
        </div>
        {recipe.description && (
          <p className="mt-3 text-xs leading-relaxed text-ink/60 dark:text-cream/60">{recipe.description}</p>
        )}
        {Array.isArray(recipe.tags) && recipe.tags.length > 0 && (
          <div className="scrollbar-hidden mt-2 flex h-6 w-full max-w-full flex-nowrap items-center gap-1.5 overflow-x-auto overflow-y-hidden py-1 touch-pan-x shrink-0">
            {recipe.tags.map((tag) => (
              <span key={tag} className="shrink-0 rounded-full bg-sage px-2.5 py-1 text-[10px] font-bold text-moss dark:bg-moss/30 dark:text-sage">
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => onAddToMenu(recipe)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-moss text-white transition hover:bg-ink"
            title="Agregar al menú"
            aria-label={`Agregar ${recipe.name} al menú`}
          >
            <CirclePlus size={19} />
          </button>
          {onViewDetails && (
            <button
              type="button"
              onClick={() => onViewDetails(recipe)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-moss/25 text-moss transition hover:bg-sage dark:border-sage/20 dark:text-sage dark:hover:bg-moss/30"
              title="Ver detalle"
              aria-label={`Ver detalle de ${recipe.name}`}
            >
              <Info size={19} />
            </button>
          )}
          {canManage && onEditRecipe && (
            <button
              type="button"
              onClick={() => onEditRecipe(recipe)}
              className="rounded-full border border-ink/15 px-4 py-2.5 text-xs font-bold text-ink/70 transition hover:bg-white dark:border-cream/15 dark:text-cream/70 dark:hover:bg-ink-soft"
            >
              Editar
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
