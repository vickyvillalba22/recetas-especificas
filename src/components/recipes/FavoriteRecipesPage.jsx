'use client'

import { useEffect, useState } from 'react'
import { RecipeGallery } from './RecipeGallery'
import { RecipeDetailsModal } from './RecipeDetailsModal'
import { RemoveFavoriteModal } from './RemoveFavoriteModal'
import { deleteFavoriteRecipe, getFavoriteRecipes } from '../../services/recipes/favoriteRecipesService'
import { useRecipeMenuFlow } from '../../hooks/useRecipeMenuFlow'

export function FavoriteRecipesPage() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [favoriteToRemove, setFavoriteToRemove] = useState(null)
  const [removeLoading, setRemoveLoading] = useState(false)
  const [removeError, setRemoveError] = useState('')
  const [detailsRecipe, setDetailsRecipe] = useState(null)
  const { openAddRecipe, modals: recipeMenuModals } = useRecipeMenuFlow()

  useEffect(() => {
    let active = true
    getFavoriteRecipes()
      .then((data) => {
        if (active) setRecipes(data)
      })
      .catch((loadError) => {
        if (active) setError(loadError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  function addToMenu(recipe) {
    setDetailsRecipe(null)
    openAddRecipe(recipe)
  }

  function requestRemoveFavorite(recipe) {
    setRemoveError('')
    setFavoriteToRemove(recipe)
  }

  async function removeFavorite() {
    if (!favoriteToRemove) return
    setRemoveLoading(true)
    setRemoveError('')
    try {
      await deleteFavoriteRecipe({ id: favoriteToRemove.id })
      setRecipes((current) => current.filter((recipe) => recipe.id !== favoriteToRemove.id))
      setFavoriteToRemove(null)
    } catch (deleteError) {
      setRemoveError(deleteError.message)
    } finally {
      setRemoveLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream text-ink dark:bg-ink-dark dark:text-cream">
      <main className="mx-auto max-w-[1440px] px-5 pb-20 pt-10 lg:px-10 lg:pt-16">
        <RecipeGallery
          mode="favorites"
          recipes={recipes}
          loading={loading}
          error={error}
          onAddToMenu={addToMenu}
          onViewDetails={setDetailsRecipe}
          favoriteRecipeIds={new Set(recipes.map((recipe) => recipe.id))}
          onToggleFavorite={requestRemoveFavorite}
          favoriteError={removeError}
        />
      </main>
      {favoriteToRemove && (
        <RemoveFavoriteModal
          recipe={favoriteToRemove}
          onClose={() => !removeLoading && setFavoriteToRemove(null)}
          onConfirm={removeFavorite}
          loading={removeLoading}
          error={removeError}
        />
      )}
      {detailsRecipe && (
        <RecipeDetailsModal
          recipe={detailsRecipe}
          onClose={() => setDetailsRecipe(null)}
          onAddToMenu={addToMenu}
          onToggleFavorite={requestRemoveFavorite}
          isFavorite
          favoriteLoading={removeLoading}
          favoriteSaving={false}
        />
      )}
      {recipeMenuModals}
    </div>
  )
}
