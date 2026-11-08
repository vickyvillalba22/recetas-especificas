'use client'

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import {
  firebaseTimestampToISOString,
  getCurrentUserId,
  getUserCollection,
  getUserDocument,
  runFirestoreOperation,
} from './firestoreService'
import { db } from '../lib/firebase/client'

function getMonday(date) {
  const monday = new Date(date)
  monday.setHours(0, 0, 0, 0)
  const day = monday.getDay()
  monday.setDate(monday.getDate() - ((day + 6) % 7))
  return monday
}

function parseDateKey(dateKey) {
  const [year, month, day] = String(dateKey).split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatDateKey(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
}

function getWeekId(dateKey) {
  return formatDateKey(getMonday(parseDateKey(dateKey)))
}

function getWeekEnd(startDate) {
  const end = new Date(startDate)
  end.setDate(end.getDate() + 6)
  return formatDateKey(end)
}

function getWeekReferences(weekId) {
  return {
    weekRef: getUserDocument('weeklyMenus', weekId),
    mealsRef: getUserCollection(`weeklyMenus/${weekId}/meals`),
  }
}

function normalizeIngredients(ingredients) {
  return Array.isArray(ingredients) ? ingredients.filter(Boolean) : []
}

function mapMeal(snapshot) {
  const data = snapshot.data()
  return {
    id: snapshot.id,
    userId: data.userId,
    date: data.date,
    mealType: data.mealType,
    name: data.name || '',
    ingredients: normalizeIngredients(data.ingredients),
    createdAt: firebaseTimestampToISOString(data.createdAt),
    updatedAt: firebaseTimestampToISOString(data.updatedAt),
  }
}

async function ensureWeekDocument(weekId) {
  const weekStart = parseDateKey(weekId)
  const { weekRef } = getWeekReferences(weekId)
  await setDoc(weekRef, {
    weekId,
    startDate: weekId,
    endDate: getWeekEnd(weekStart),
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

export async function getWeeklyMenu({ startDate, endDate }) {
  return runFirestoreOperation(async () => {
    const mealsRef = getWeekReferences(getWeekId(startDate)).mealsRef
    const mealsQuery = query(mealsRef, where('date', '>=', startDate), where('date', '<=', endDate))
    const snapshot = await getDocs(mealsQuery)
    return snapshot.docs
      .sort((first, second) => {
        const dateCompare = String(first.data().date).localeCompare(String(second.data().date))
        return dateCompare || String(first.data().mealType).localeCompare(String(second.data().mealType))
      })
      .map(mapMeal)
  }, 'No se pudo cargar el menú semanal.')
}

export async function createMeal({ date, mealType, recipeName, ingredients = [] }) {
  return runFirestoreOperation(async () => {
    const userId = getCurrentUserId()
    const weekId = getWeekId(date)
    const { mealsRef } = getWeekReferences(weekId)
    const mealRef = await addDoc(mealsRef, {
      userId,
      date,
      mealType,
      name: recipeName,
      ingredients: normalizeIngredients(ingredients),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    await ensureWeekDocument(weekId)
    const snapshot = await getDoc(mealRef)
    return mapMeal(snapshot)
  }, 'No se pudo guardar la comida.')
}

export async function updateMeal({ id, date, mealType, recipeName, ingredients = [] }) {
  return runFirestoreOperation(async () => {
    const { mealsRef } = getWeekReferences(getWeekId(date))
    const mealRef = doc(mealsRef, id)
    await updateDoc(mealRef, {
      date,
      mealType,
      name: recipeName,
      ingredients: normalizeIngredients(ingredients),
      updatedAt: serverTimestamp(),
    })
    await ensureWeekDocument(getWeekId(date))
    return mapMeal(await getDoc(mealRef))
  }, 'No se pudo actualizar la comida.')
}

export async function moveOrSwapMeals({ sourceId, sourceDate, sourceMealType, targetId = null, targetDate, targetMealType }) {
  return runFirestoreOperation(async () => {
    const sourceWeekId = getWeekId(sourceDate)
    const targetWeekId = getWeekId(targetDate)
    const sourceReferences = getWeekReferences(sourceWeekId)
    const targetReferences = getWeekReferences(targetWeekId)
    const sourceRef = doc(sourceReferences.mealsRef, sourceId)
    let targetRef = targetId ? doc(targetReferences.mealsRef, targetId) : null

    // Firestore transactions can read document references, but not queries.
    // Resolve an occupied target slot before opening the transaction so that
    // every transaction.get() below receives a DocumentReference.
    if (!targetRef) {
      const targetSlotQuery = query(targetReferences.mealsRef, where('date', '==', targetDate), where('mealType', '==', targetMealType))
      const targetSnapshot = (await getDocs(targetSlotQuery)).docs.find((item) => item.id !== sourceId)
      targetRef = targetSnapshot?.ref || null
    }

    const result = await runTransaction(db, async (transaction) => {
      const sourceSnapshot = await transaction.get(sourceRef)
      const targetSnapshot = targetRef ? await transaction.get(targetRef) : null

      if (!sourceSnapshot.exists()) throw new Error('La comida origen no existe.')

      const sourceData = sourceSnapshot.data()
      if (sourceData.date !== sourceDate || sourceData.mealType !== sourceMealType) {
        throw new Error('La comida origen cambió antes de moverla.')
      }

      if (targetRef && !targetSnapshot.exists()) throw new Error('La comida destino no existe.')

      transaction.update(sourceRef, {
        date: targetDate,
        mealType: targetMealType,
        updatedAt: serverTimestamp(),
      })

      if (targetSnapshot) {
        const targetData = targetSnapshot.data()
        transaction.update(targetRef, {
          date: sourceDate,
          mealType: sourceMealType,
          updatedAt: serverTimestamp(),
        })
        return [
          { id: sourceSnapshot.id, ...sourceData, date: targetDate, mealType: targetMealType },
          { id: targetSnapshot.id, ...targetData, date: sourceDate, mealType: sourceMealType },
        ]
      }

      return [{ id: sourceSnapshot.id, ...sourceData, date: targetDate, mealType: targetMealType }]
    })

    await Promise.all([
      ensureWeekDocument(sourceWeekId),
      sourceWeekId === targetWeekId ? Promise.resolve() : ensureWeekDocument(targetWeekId),
    ])

    return result.map((meal) => ({
      id: meal.id,
      userId: meal.userId,
      date: meal.date,
      mealType: meal.mealType,
      name: meal.name || '',
      ingredients: normalizeIngredients(meal.ingredients),
      createdAt: firebaseTimestampToISOString(meal.createdAt),
      updatedAt: firebaseTimestampToISOString(meal.updatedAt),
    }))
  }, 'No se pudo mover la comida.')
}

export async function deleteMeal({ id, date }) {
  return runFirestoreOperation(async () => {
    if (!date) throw new Error('Se necesita la fecha de la comida para eliminarla.')
    const mealRef = doc(getWeekReferences(getWeekId(date)).mealsRef, id)
    await deleteDoc(mealRef)
    await ensureWeekDocument(getWeekId(date))
  }, 'No se pudo eliminar la comida.')
}
