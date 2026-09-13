import { BookHeart, CirclePlus, Clock3, X } from '../ui/icons'

function formatList(values) {
  return Array.isArray(values) ? values : []
}

export function RecipeGallery({ recipes, loading, error, onAddRecipe, onEditRecipe, onDeleteRecipe, onAddToMenu }) {
  return <section id="recetas" className="mt-8 rounded-3xl border border-ink/10 bg-white p-6 shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark sm:p-10">
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-sage px-3 py-1.5 text-xs font-bold text-moss dark:bg-moss/30 dark:text-sage"><BookHeart size={14} /> Mis recetas</span>
        <h2 className="font-display text-3xl leading-tight sm:text-4xl">Recetas para<br /><em className="font-normal text-coral">volver a elegir.</em></h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink/60 dark:text-cream/60">Guarda tus recetas favoritas y tenlas siempre a mano para organizar tu semana.</p>
      </div>
      <button onClick={onAddRecipe} className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-coral px-5 py-3 text-sm font-bold text-white transition hover:bg-[#d9624c]"><CirclePlus size={16} /> Agregar receta</button>
    </div>
    {loading && <p className="rounded-2xl bg-cream px-4 py-6 text-center text-sm text-ink/50 dark:bg-ink dark:text-cream/50">Cargando recetas...</p>}
    {error && <p className="rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral">No pudimos cargar las recetas: {error}</p>}
    {!loading && !error && recipes.length === 0 && <div className="grid min-h-40 place-items-center rounded-2xl border border-dashed border-ink/15 px-6 text-center dark:border-cream/15"><div><BookHeart className="mx-auto mb-3 text-moss/40 dark:text-sage/40" size={26} /><p className="text-sm font-semibold text-ink/60 dark:text-cream/60">Todavía no hay recetas guardadas</p><p className="mt-1 text-xs text-ink/40 dark:text-cream/40">Agrega tu primera receta para verla aquí.</p></div></div>}
    {!loading && recipes.length > 0 && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{recipes.map((recipe) => <article key={recipe.id} className="flex flex-col rounded-2xl border border-ink/10 bg-cream p-5 dark:border-cream/10 dark:bg-ink"><div className="flex items-start justify-between gap-3"><div><h3 className="font-display text-2xl text-moss dark:text-sage">{recipe.name}</h3>{recipe.time && <p className="mt-2 flex items-center gap-1 text-xs font-bold text-coral"><Clock3 size={13} /> {recipe.time}</p>}</div><button onClick={() => onDeleteRecipe(recipe)} className="rounded-full p-2 text-ink/40 transition hover:bg-coral/10 hover:text-coral dark:text-cream/40" aria-label={`Eliminar ${recipe.name}`}><X size={17} /></button></div>{recipe.description && <p className="mt-3 text-sm leading-relaxed text-ink/60 dark:text-cream/60">{recipe.description}</p>}{recipe.tags?.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{recipe.tags.map((tag) => <span key={tag} className="rounded-full bg-sage px-2.5 py-1 text-[10px] font-bold text-moss dark:bg-moss/30 dark:text-sage">{tag}</span>)}</div>}<div className="mt-auto flex flex-wrap gap-2 pt-5"><button onClick={() => onAddToMenu(recipe)} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-moss px-3 py-2.5 text-xs font-bold text-white transition hover:bg-ink"><CirclePlus size={14} /> Agregar al menú</button><button onClick={() => onEditRecipe(recipe)} className="rounded-full border border-ink/15 px-4 py-2.5 text-xs font-bold text-ink/70 transition hover:bg-white dark:border-cream/15 dark:text-cream/70 dark:hover:bg-ink-soft">Editar</button></div></article>)}</div>}
  </section>
}
