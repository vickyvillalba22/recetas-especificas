'use client'

import { addDoc, deleteDoc, getDoc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore'
import {
  firebaseTimestampToDate,
  firebaseTimestampToISOString,
  getCurrentUserId,
  getUserCollection,
  getUserDocument,
  runFirestoreOperation,
} from './firestoreService'

function formatJournalDate(value) {
  const date = firebaseTimestampToDate(value)
  return date
    ? date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : 'Sin fecha'
}

function formatJournalTime(value) {
  const date = firebaseTimestampToDate(value)
  return date
    ? date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    : 'Sin hora'
}

function mapJournalEntry(snapshot) {
  const data = snapshot.data()
  return {
    id: snapshot.id,
    userId: data.userId,
    text: data.text || '',
    date: formatJournalDate(data.createdAt),
    time: formatJournalTime(data.createdAt),
    createdAt: firebaseTimestampToISOString(data.createdAt),
    updatedAt: firebaseTimestampToISOString(data.updatedAt),
  }
}

export async function getJournalEntries() {
  return runFirestoreOperation(async () => {
    const snapshot = await getDocs(getUserCollection('journalEntries'))
    return snapshot.docs
      .map(mapJournalEntry)
      .sort((first, second) => String(second.createdAt || '').localeCompare(String(first.createdAt || '')))
  }, 'No se pudieron cargar las entradas del diario.')
}

export async function createJournalEntry(text) {
  return runFirestoreOperation(async () => {
    const entryRef = await addDoc(getUserCollection('journalEntries'), {
      userId: getCurrentUserId(),
      text,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return mapJournalEntry(await getDoc(entryRef))
  }, 'No se pudo guardar la entrada del diario.')
}

export async function updateJournalEntry({ id, text }) {
  return runFirestoreOperation(async () => {
    const entryRef = getUserDocument('journalEntries', id)
    await updateDoc(entryRef, {
      text,
      updatedAt: serverTimestamp(),
    })
    return mapJournalEntry(await getDoc(entryRef))
  }, 'No se pudo actualizar la entrada del diario.')
}

export async function deleteJournalEntry({ id }) {
  return runFirestoreOperation(async () => {
    await deleteDoc(getUserDocument('journalEntries', id))
  }, 'No se pudo eliminar la entrada del diario.')
}
