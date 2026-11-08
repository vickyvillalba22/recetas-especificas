'use client'

import { addDoc, collection, deleteDoc, getDoc, getDocs, query, serverTimestamp, updateDoc, where, doc } from 'firebase/firestore'
import { db } from '../lib/firebase/client'
import { getCurrentUserId, runFirestoreOperation } from './firestoreService'
import { mapRecipeSnapshot, recipePayload } from './recipeServiceUtils'

const recipesRef = collection(db, 'publicRecipes')

function sortRecipes(recipes) {
  return recipes.sort((first, second) => String(second.createdAt || '').localeCompare(String(first.createdAt || '')))
}

export async function getPublicRecipes() {
  return runFirestoreOperation(async () => {
    const snapshot = await getDocs(query(recipesRef, where('published', '==', true)))
    return sortRecipes(snapshot.docs.map(mapRecipeSnapshot))
  }, 'No se pudieron cargar las recetas generales.')
}

export async function getAllPublicRecipes() {
  return runFirestoreOperation(async () => {
    const snapshot = await getDocs(recipesRef)
    return sortRecipes(snapshot.docs.map(mapRecipeSnapshot))
  }, 'No se pudieron cargar las recetas generales.')
}

export async function createPublicRecipe({ published = true, ...data }) {
  return runFirestoreOperation(async () => {
    const recipeRef = await addDoc(recipesRef, {
      ...recipePayload(data),
      createdBy: getCurrentUserId(),
      published,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return mapRecipeSnapshot(await getDoc(recipeRef))
  }, 'No se pudo crear la receta general.')
}

export async function updatePublicRecipe({ id, published, ...data }) {
  return runFirestoreOperation(async () => {
    const recipeRef = doc(db, 'publicRecipes', id)
    await updateDoc(recipeRef, {
      ...recipePayload(data),
      ...(typeof published === 'boolean' ? { published } : {}),
      updatedAt: serverTimestamp(),
    })
    return mapRecipeSnapshot(await getDoc(recipeRef))
  }, 'No se pudo actualizar la receta general.')
}

export async function deletePublicRecipe({ id }) {
  return runFirestoreOperation(async () => {
    await deleteDoc(doc(db, 'publicRecipes', id))
  }, 'No se pudo eliminar la receta general.')
}
