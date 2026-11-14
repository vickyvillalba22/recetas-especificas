'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RecipeGallery } from './RecipeGallery'
import { RemoveFavoriteModal } from './RemoveFavoriteModal'
import { deleteFavoriteRecipe, getFavoriteRecipes } from '../../services/favoriteRecipesService'

export function FavoriteRecipesPage() {
  const router = useRouter()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [favoriteToRemove, setFavoriteToRemove] = useState(null)
  const [removeLoading, setRemoveLoading] = useState(false)
  const [removeError, setRemoveError] = useState('')

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
    sessionStorage.setItem('sibo-recipe-to-add', JSON.stringify(recipe))
    router.push('/?addRecipe=1')
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
    </div>
  )
}
