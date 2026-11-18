"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RecipeFormModal } from "./RecipeFormModal";
import { RecipeGallery } from "./RecipeGallery";
import { RecipeDetailsModal } from "./RecipeDetailsModal";
import { RemoveFavoriteModal } from "./RemoveFavoriteModal";
import {
  createPersonalRecipe,
  deletePersonalRecipe,
  getPersonalRecipes,
  updatePersonalRecipe,
} from "../../services/recipes/personalRecipesService";
import { getPublicRecipes } from "../../services/recipes/publicRecipesService";
import {
  deleteFavoriteRecipe,
  getFavoriteRecipes,
  saveFavoriteRecipe,
} from "../../services/recipes/favoriteRecipesService";

const personalService = {
  create: createPersonalRecipe,
  update: updatePersonalRecipe,
  remove: deletePersonalRecipe,
};

export function RecipesPageClient({ mode = "public" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPersonal = mode === "personal";
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState(() => new Set());
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteSavingId, setFavoriteSavingId] = useState(null);
  const [favoriteToRemove, setFavoriteToRemove] = useState(null);
  const [favoriteRemoveLoading, setFavoriteRemoveLoading] = useState(false);
  const [favoriteError, setFavoriteError] = useState("");
  const [detailsRecipe, setDetailsRecipe] = useState(null);
  const [formRecipe, setFormRecipe] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setFavoriteError("");
    const loadRecipes = isPersonal ? getPersonalRecipes : getPublicRecipes;
    loadRecipes()
      .then((data) => {
        if (active) setRecipes(data);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    if (isPersonal) {
      setFavoriteRecipeIds(new Set());
      setFavoriteLoading(false);
    } else {
      setFavoriteLoading(true);
      getFavoriteRecipes()
        .then((favorites) => {
          if (active) setFavoriteRecipeIds(new Set(favorites.map((recipe) => recipe.id)));
        })
        .catch((favoriteLoadError) => {
          if (active) setFavoriteError(favoriteLoadError.message);
        })
        .finally(() => {
          if (active) setFavoriteLoading(false);
        });
    }

    return () => {
      active = false;
    };
  }, [isPersonal]);

  useEffect(() => {
    if (!isPersonal || !searchParams.get("new")) return;
    openForm();
    router.replace("/mis-recetas", { scroll: false });
  }, [isPersonal, router, searchParams]);

  function openForm(recipe = {}) {
    setFormError("");
    setFormRecipe(recipe);
  }

  function closeForm() {
    setFormRecipe(null);
    setFormError("");
  }

  async function saveRecipe(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const data = {
      name: form.get("name")?.trim(),
      description: form.get("description")?.trim(),
      ingredients: form
        .get("ingredients")
        ?.split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      steps: form
        .get("steps")
        ?.split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      time: form.get("time")?.trim(),
      tags: form
        .get("tags")
        ?.split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      imageUrl: form.get("imageUrl")?.trim(),
    };
    if (!data.name || !isPersonal) return;

    setFormLoading(true);
    setFormError("");
    try {
      const save = formRecipe?.id
        ? personalService.update
        : personalService.create;
      const saved = await save(
        formRecipe?.id ? { id: formRecipe.id, ...data } : data,
      );
      setRecipes((current) =>
        formRecipe?.id
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...current],
      );
      closeForm();
    } catch (saveError) {
      setFormError(saveError.message);
    } finally {
      setFormLoading(false);
    }
  }

  async function removeRecipe(recipe) {
    if (!window.confirm(`¿Eliminar la receta "${recipe.name}"?`)) return;
    try {
      await personalService.remove({ id: recipe.id });
      setRecipes((current) => current.filter((item) => item.id !== recipe.id));
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function saveFavorite(recipe) {
    setFavoriteSavingId(recipe.id);
    setFavoriteError("");
    try {
      await saveFavoriteRecipe(recipe);
      setFavoriteRecipeIds((current) => new Set(current).add(recipe.id));
    } catch (favoriteSaveError) {
      setFavoriteError(favoriteSaveError.message);
    } finally {
      setFavoriteSavingId(null);
    }
  }

  function toggleFavorite(recipe) {
    if (favoriteRecipeIds.has(recipe.id)) {
      setFavoriteError("");
      setFavoriteToRemove(recipe);
      return;
    }

    saveFavorite(recipe);
  }

  async function removeFavorite() {
    if (!favoriteToRemove) return;
    setFavoriteRemoveLoading(true);
    setFavoriteError("");
    try {
      await deleteFavoriteRecipe({ id: favoriteToRemove.id });
      setFavoriteRecipeIds((current) => {
        const next = new Set(current);
        next.delete(favoriteToRemove.id);
        return next;
      });
      setFavoriteToRemove(null);
    } catch (favoriteDeleteError) {
      setFavoriteError(favoriteDeleteError.message);
    } finally {
      setFavoriteRemoveLoading(false);
    }
  }

  function addToMenu(recipe) {
    sessionStorage.setItem("sibo-recipe-to-add", JSON.stringify(recipe));
    router.push("/?addRecipe=1");
  }

  return (
    <div className="min-h-screen bg-cream text-ink dark:bg-ink-dark dark:text-cream">
      <main className="mx-auto max-w-[1440px] px-5 pb-20 pt-2 lg:px-10 lg:pt-10">
        <RecipeGallery
          mode={mode}
          recipes={recipes}
          loading={loading}
          error={error}
          onAddRecipe={isPersonal ? () => openForm() : undefined}
           onEditRecipe={isPersonal ? openForm : undefined}
           onDeleteRecipe={isPersonal ? removeRecipe : undefined}
           onAddToMenu={addToMenu}
           onViewDetails={!isPersonal ? setDetailsRecipe : undefined}
           favoriteRecipeIds={favoriteRecipeIds}
           onToggleFavorite={!isPersonal ? toggleFavorite : undefined}
           favoriteLoading={favoriteLoading}
           favoriteSavingId={favoriteSavingId}
           favoriteError={!isPersonal ? favoriteError : ""}
         />
      </main>
      {isPersonal && formRecipe && (
        <RecipeFormModal
          recipe={formRecipe}
          onClose={closeForm}
          onSubmit={saveRecipe}
          loading={formLoading}
          error={formError}
        />
      )}
      {favoriteToRemove && (
        <RemoveFavoriteModal
          recipe={favoriteToRemove}
          onClose={() => !favoriteRemoveLoading && setFavoriteToRemove(null)}
          onConfirm={removeFavorite}
          loading={favoriteRemoveLoading}
          error={favoriteError}
        />
      )}
      {detailsRecipe && (
        <RecipeDetailsModal
          recipe={detailsRecipe}
          onClose={() => setDetailsRecipe(null)}
          onAddToMenu={addToMenu}
          onToggleFavorite={toggleFavorite}
          isFavorite={favoriteRecipeIds.has(detailsRecipe.id)}
          favoriteLoading={favoriteLoading}
          favoriteSaving={favoriteSavingId === detailsRecipe.id}
        />
      )}
    </div>
  );
}
