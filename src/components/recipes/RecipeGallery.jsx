import Link from "next/link";
import { BookHeart, CirclePlus, Clock3, Star, X } from "../ui/icons";

// Shared by the public recipes and admin recipe pages.
function formatList(values) {
  return Array.isArray(values) ? values : [];
}

export function RecipeGallery({
  recipes,
  loading,
  error,
  onAddRecipe,
  onEditRecipe,
  onDeleteRecipe,
  onAddToMenu,
  favoriteRecipeIds = new Set(),
  onToggleFavorite,
  favoriteLoading = false,
  favoriteSavingId = null,
  favoriteError = "",
  mode = "personal",
}) {
  const isPublic = mode === "public";
  const isAdmin = mode === "admin";
  const isFavorites = mode === "favorites";
  const canManage = !isPublic && !isFavorites;
  const label = isPublic
    ? "Recetas generales"
    : isAdmin
      ? "Administración"
      : isFavorites
        ? "Recetas favoritas"
        : "Mis recetas";
  const title = isPublic ? (
    <>
      Recetas para
      <em className="font-normal text-coral pl-3">volver a elegir.</em>
    </>
  ) : isAdmin ? (
    <>
      Recetas
      <em className="font-normal text-coral pl-3">generales públicas.</em>
    </>
  ) : isFavorites ? (
    <>
      Tus recetas
      <em className="font-normal text-coral pl-3">favoritas.</em>
    </>
  ) : (
    <>
      Tus recetas
      <br />
      <em className="font-normal text-coral">a mano.</em>
    </>
  );
  const description = isPublic
    ? "Explorá recetas generales y agregalas a tu menú semanal."
    : isAdmin
      ? "Creá y administrá las recetas disponibles para todos los usuarios autenticados."
      : isFavorites
        ? "Volvé a encontrar las recetas generales que guardaste."
        : "Guardá tus recetas personales para volver a encontrarlas al organizar tu semana.";

  return (
    <section
      id="recetas"
      className="mt-8 rounded-3xl border border-ink/10 bg-white p-6 shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark sm:p-10"
    >
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-sage px-3 py-1.5 text-xs font-bold text-moss dark:bg-moss/30 dark:text-sage">
            <BookHeart size={14} /> {label}
          </span>
          <h2 className="font-display text-3xl leading-tight sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink/60 dark:text-cream/60">
            {description}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {isPublic && (
            <>
              <Link href="/mis-recetas" className="rounded-full border border-moss/25 px-4 py-2.5 text-xs font-bold text-moss transition hover:bg-sage dark:border-sage/20 dark:text-sage dark:hover:bg-moss/30">
                Ver mis recetas
              </Link>
              <Link href="/recetas-favoritas" className="rounded-full border border-sun/50 px-4 py-2.5 text-xs font-bold text-ink transition hover:bg-sun/20 dark:text-cream">
                Ver mis favoritos
              </Link>
            </>
          )}
          {canManage && onAddRecipe && (
            <button
              onClick={onAddRecipe}
              className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-coral px-5 py-3 text-sm font-bold text-white transition hover:bg-[#d9624c] sm:flex"
            >
              <CirclePlus size={16} /> Agregar receta
            </button>
          )}
        </div>
      </div>
      {loading && (
        <p className="rounded-2xl bg-cream px-4 py-6 text-center text-sm text-ink/50 dark:bg-ink dark:text-cream/50">
          Cargando recetas...
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral">
          No pudimos cargar las recetas: {error}
        </p>
      )}
      {favoriteError && (
        <p className="mb-4 rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral">
          {favoriteError}
        </p>
      )}
      {!loading && !error && recipes.length === 0 && (
        <div className="grid min-h-40 place-items-center rounded-2xl border border-dashed border-ink/15 px-6 text-center dark:border-cream/15">
          <div>
            <BookHeart
              className="mx-auto mb-3 text-moss/40 dark:text-sage/40"
              size={26}
            />
            <p className="text-sm font-semibold text-ink/60 dark:text-cream/60">
              Todavía no hay recetas
            </p>
            <p className="mt-1 text-xs text-ink/40 dark:text-cream/40">
              {isPublic
                ? "Las recetas generales aparecerán aquí."
                : isFavorites
                  ? "Las recetas que guardes aparecerán aquí."
                  : "Agregá tu primera receta para verla aquí."}
            </p>
          </div>
        </div>
      )}
      {!loading && recipes.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recipes.map((recipe) => (
            <article
              key={recipe.id}
              className="flex flex-col rounded-2xl border border-ink/10 bg-cream p-5 dark:border-cream/10 dark:bg-ink"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl text-moss dark:text-sage">
                    {recipe.name}
                  </h3>
                  {recipe.time && (
                    <p className="mt-2 flex items-center gap-1 text-xs font-bold text-coral">
                      <Clock3 size={13} /> {recipe.time}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {(isPublic || isFavorites) && onToggleFavorite && (
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(recipe)}
                      disabled={favoriteLoading || favoriteSavingId === recipe.id}
                      className={`grid h-9 w-9 place-items-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${favoriteRecipeIds.has(recipe.id) ? 'bg-sun/20 text-sun' : 'text-ink/35 hover:bg-sun/10 hover:text-sun dark:text-cream/40'}`}
                      aria-label={favoriteRecipeIds.has(recipe.id) ? `Quitar ${recipe.name} de favoritos` : `Agregar ${recipe.name} a favoritos`}
                      aria-pressed={favoriteRecipeIds.has(recipe.id)}
                    >
                      <Star size={18} className={favoriteRecipeIds.has(recipe.id) ? 'fill-current' : ''} />
                    </button>
                  )}
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
                <p className="mt-3 text-sm leading-relaxed text-ink/60 dark:text-cream/60">
                  {recipe.description}
                </p>
              )}
              {formatList(recipe.tags).length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {formatList(recipe.tags).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-sage px-2.5 py-1 text-[10px] font-bold text-moss dark:bg-moss/30 dark:text-sage"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-auto flex flex-wrap gap-2 pt-5">
                <button
                  onClick={() => onAddToMenu(recipe)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-moss px-3 py-2.5 text-xs font-bold text-white transition hover:bg-ink"
                >
                  <CirclePlus size={14} /> Agregar al menú
                </button>
                {canManage && onEditRecipe && (
                  <button
                    onClick={() => onEditRecipe(recipe)}
                    className="rounded-full border border-ink/15 px-4 py-2.5 text-xs font-bold text-ink/70 transition hover:bg-white dark:border-cream/15 dark:text-cream/70 dark:hover:bg-ink-soft"
                  >
                    Editar
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
