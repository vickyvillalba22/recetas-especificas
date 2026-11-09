"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Footer } from "../home/Footer";
import { RecipeFormModal } from "../home/RecipeFormModal";
import { RecipeGallery } from "../home/RecipeGallery";
import {
  createPersonalRecipe,
  deletePersonalRecipe,
  getPersonalRecipes,
  updatePersonalRecipe,
} from "../../services/personalRecipesService";
import { getPublicRecipes } from "../../services/publicRecipesService";

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
  const [formRecipe, setFormRecipe] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
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

  function addToMenu(recipe) {
    sessionStorage.setItem("sibo-recipe-to-add", JSON.stringify(recipe));
    router.push("/?addRecipe=1");
  }

  return (
    <div className="min-h-screen bg-cream text-ink dark:bg-ink-dark dark:text-cream">
      <main className="mx-auto max-w-[1440px] px-5 pb-20 pt-10 lg:px-10 lg:pt-16">
        <RecipeGallery
          mode={mode}
          recipes={recipes}
          loading={loading}
          error={error}
          onAddRecipe={isPersonal ? () => openForm() : undefined}
          onEditRecipe={isPersonal ? openForm : undefined}
          onDeleteRecipe={isPersonal ? removeRecipe : undefined}
          onAddToMenu={addToMenu}
        />
      </main>
      <Footer />
      {isPersonal && formRecipe && (
        <RecipeFormModal
          recipe={formRecipe}
          onClose={closeForm}
          onSubmit={saveRecipe}
          loading={formLoading}
          error={formError}
        />
      )}
    </div>
  );
}
