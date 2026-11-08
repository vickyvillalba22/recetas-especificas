'use client'

import { getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { getUserDocument, runFirestoreOperation } from './firestoreService'

function normalizeItems(items) {
  return Array.isArray(items)
    ? items
        .filter((item) => item?.name)
        .map((item) => ({
          name: String(item.name),
          count: Number(item.count) || 1,
          checked: Boolean(item.checked),
        }))
    : []
}

function mapShoppingList(snapshot) {
  if (!snapshot.exists()) return null
  const data = snapshot.data()
  return {
    weekId: data.weekId || snapshot.id,
    items: normalizeItems(data.items),
    updatedAt: data.updatedAt || null,
  }
}

export async function getShoppingList({ weekId }) {
  return runFirestoreOperation(async () => {
    const snapshot = await getDoc(getUserDocument('shoppingLists', weekId))
    return mapShoppingList(snapshot)
  }, 'No se pudo cargar la lista de compras.')
}

export async function saveShoppingList({ weekId, items }) {
  return runFirestoreOperation(async () => {
    const listRef = getUserDocument('shoppingLists', weekId)
    await setDoc(listRef, {
      weekId,
      items: normalizeItems(items),
      updatedAt: serverTimestamp(),
    }, { merge: true })
    return mapShoppingList(await getDoc(listRef))
  }, 'No se pudo guardar la lista de compras.')
}
