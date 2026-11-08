'use client'

import { addDoc, deleteDoc, getDoc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore'
import {
  getCurrentUserId,
  getUserCollection,
  getUserDocument,
  runFirestoreOperation,
} from './firestoreService'
import { mapRecipeSnapshot, recipePayload } from './recipeServiceUtils'

function sortRecipes(recipes) {
  return recipes.sort((first, second) => String(second.createdAt || '').localeCompare(String(first.createdAt || '')))
}

export async function getPersonalRecipes() {
  return runFirestoreOperation(async () => {
    const snapshot = await getDocs(getUserCollection('personalRecipes'))
    return sortRecipes(snapshot.docs.map(mapRecipeSnapshot))
  }, 'No se pudieron cargar tus recetas.')
}

export async function createPersonalRecipe(data) {
  return runFirestoreOperation(async () => {
    const recipeRef = await addDoc(getUserCollection('personalRecipes'), {
      ...recipePayload(data),
      userId: getCurrentUserId(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return mapRecipeSnapshot(await getDoc(recipeRef))
  }, 'No se pudo guardar tu receta.')
}

export async function updatePersonalRecipe({ id, ...data }) {
  return runFirestoreOperation(async () => {
    const recipeRef = getUserDocument('personalRecipes', id)
    await updateDoc(recipeRef, {
      ...recipePayload(data),
      updatedAt: serverTimestamp(),
    })
    return mapRecipeSnapshot(await getDoc(recipeRef))
  }, 'No se pudo actualizar tu receta.')
}

export async function deletePersonalRecipe({ id }) {
  return runFirestoreOperation(async () => {
    await deleteDoc(getUserDocument('personalRecipes', id))
  }, 'No se pudo eliminar tu receta.')
}
