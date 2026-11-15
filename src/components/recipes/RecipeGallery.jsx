"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BookHeart, Check, CirclePlus, Filter } from "../ui/icons";
import { RecipeCard } from "./RecipeCard";

export function RecipeGallery({
  recipes,
  loading,
  error,
  onAddRecipe,
  onEditRecipe,
  onDeleteRecipe,
  onAddToMenu,
  onViewDetails,
  favoriteRecipeIds = new Set(),
  onToggleFavorite,
  favoriteLoading = false,
  favoriteSavingId = null,
  favoriteError = "",
  mode = "personal",
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [fodmapOnly, setFodmapOnly] = useState(false);
  const filterRef = useRef(null);
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
  const visibleRecipes = fodmapOnly
    ? recipes.filter((recipe) => formatTags(recipe.tags).some((tag) => tag.toLocaleLowerCase() === "bajo en fodmap"))
    : recipes;

  function formatTags(values) {
    return Array.isArray(values) ? values.map((tag) => String(tag).trim()) : [];
  }

  useEffect(() => {
    if (!filterOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!filterRef.current?.contains(event.target)) setFilterOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setFilterOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [filterOpen]);

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
              <div ref={filterRef} className="relative">
                <button
                  type="button"
                  onClick={() => setFilterOpen((current) => !current)}
                  className={`grid h-10 w-10 place-items-center rounded-full border transition ${fodmapOnly ? "border-moss bg-sage text-moss dark:border-sage dark:bg-moss/30 dark:text-sage" : "border-ink/15 text-ink/60 hover:bg-sage hover:text-moss dark:border-cream/15 dark:text-cream/70 dark:hover:bg-moss/30"}`}
                  aria-label="Filtrar recetas"
                  aria-expanded={filterOpen}
                  title="Filtrar recetas"
                >
                  <Filter size={18} />
                </button>
                {filterOpen && (
                  <div className="absolute right-0 top-12 z-20 w-60 rounded-2xl border border-ink/10 bg-white p-2 shadow-soft dark:border-cream/10 dark:bg-ink-soft">
                    <button
                      type="button"
                      onClick={() => setFodmapOnly((current) => !current)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-ink transition hover:bg-sage/60 dark:text-cream dark:hover:bg-moss/30"
                      aria-pressed={fodmapOnly}
                    >
                      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${fodmapOnly ? "border-moss bg-moss text-white" : "border-ink/20 dark:border-cream/25"}`}>
                        {fodmapOnly && <Check size={14} />}
                      </span>
                      Bajo en FODMAP
                    </button>
                  </div>
                )}
              </div>
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
      {!loading && !error && visibleRecipes.length === 0 && (
        <div className="grid min-h-40 place-items-center rounded-2xl border border-dashed border-ink/15 px-6 text-center dark:border-cream/15">
          <div>
            <BookHeart
              className="mx-auto mb-3 text-moss/40 dark:text-sage/40"
              size={26}
            />
            <p className="text-sm font-semibold text-ink/60 dark:text-cream/60">
              {fodmapOnly ? "No hay recetas con este filtro" : "Todavía no hay recetas"}
            </p>
            <p className="mt-1 text-xs text-ink/40 dark:text-cream/40">
              {isPublic
                ? fodmapOnly
                  ? "Probá quitar el filtro para ver todas las recetas."
                  : "Las recetas generales aparecerán aquí."
                : isFavorites
                  ? "Las recetas que guardes aparecerán aquí."
                  : "Agregá tu primera receta para verla aquí."}
            </p>
          </div>
        </div>
      )}
      {!loading && visibleRecipes.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isPublic={isPublic}
              isFavorites={isFavorites}
              canManage={canManage}
              onAddToMenu={onAddToMenu}
              onViewDetails={onViewDetails}
              onToggleFavorite={onToggleFavorite}
              favoriteRecipeIds={favoriteRecipeIds}
              favoriteLoading={favoriteLoading}
              favoriteSavingId={favoriteSavingId}
              onDeleteRecipe={onDeleteRecipe}
              onEditRecipe={onEditRecipe}
            />
          ))}
        </div>
      )}
    </section>
  );
}
