'use client'

import { deleteDoc, getDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { getCurrentUserId, getUserCollection, getUserDocument, runFirestoreOperation } from './firestoreService'
import { mapRecipeSnapshot, recipePayload } from './recipeServiceUtils'

function sortRecipes(recipes) {
  return recipes.sort((first, second) => String(second.createdAt || '').localeCompare(String(first.createdAt || '')))
}

export async function getFavoriteRecipes() {
  return runFirestoreOperation(async () => {
    const snapshot = await getDocs(getUserCollection('favoriteRecipes'))
    return sortRecipes(snapshot.docs.map(mapRecipeSnapshot))
  }, 'No se pudieron cargar tus recetas favoritas.')
}

export async function saveFavoriteRecipe(recipe) {
  return runFirestoreOperation(async () => {
    const favoriteRef = getUserDocument('favoriteRecipes', recipe.id)
    await setDoc(favoriteRef, {
      ...recipePayload(recipe),
      userId: getCurrentUserId(),
      sourceRecipeId: recipe.id,
      published: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true })

    return mapRecipeSnapshot(await getDoc(favoriteRef))
  }, 'No se pudo guardar la receta en favoritos.')
}

export async function deleteFavoriteRecipe({ id }) {
  return runFirestoreOperation(async () => {
    await deleteDoc(getUserDocument('favoriteRecipes', id))
  }, 'No se pudo eliminar la receta de favoritos.')
}
