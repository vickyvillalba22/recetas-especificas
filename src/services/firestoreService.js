'use client'

import { auth, db } from '../lib/firebase/client'
import { collection, doc } from 'firebase/firestore'

const firestoreErrorMessages = {
  'permission-denied': 'No tenés permisos para realizar esta operación.',
  'unauthenticated': 'Necesitás iniciar sesión para realizar esta operación.',
  'not-found': 'El documento solicitado no existe.',
  'already-exists': 'El documento ya existe.',
  'failed-precondition': 'No se pudo completar la operación porque falta una configuración de Firestore.',
  unavailable: 'Firestore no está disponible. Revisá tu conexión e intentá nuevamente.',
  'deadline-exceeded': 'La operación tardó demasiado. Intentá nuevamente.',
}

export function getCurrentUser() {
  const user = auth.currentUser
  if (!user) {
    const error = new Error('Necesitás iniciar sesión para acceder a tus datos.')
    error.code = 'auth/not-authenticated'
    throw error
  }

  return user
}

export function getCurrentUserId() {
  return getCurrentUser().uid
}

export function getUserCollection(collectionName) {
  return collection(db, 'users', getCurrentUserId(), collectionName)
}

export function getUserDocument(collectionName, documentId) {
  return doc(db, 'users', getCurrentUserId(), collectionName, documentId)
}

export function normalizeFirestoreError(error, fallbackMessage = 'No se pudo completar la operación en Firestore.') {
  const code = error?.code || 'unknown'
  const shortCode = code.includes('/') ? code.split('/').pop() : code
  const normalizedError = new Error(firestoreErrorMessages[shortCode] || error?.message || fallbackMessage)
  normalizedError.code = code
  normalizedError.cause = error
  return normalizedError
}

export async function runFirestoreOperation(operation, fallbackMessage) {
  try {
    return await operation()
  } catch (error) {
    throw normalizeFirestoreError(error, fallbackMessage)
  }
}

export function firebaseTimestampToDate(value) {
  if (value == null) return null
  if (value instanceof Date) return value
  if (typeof value.toDate === 'function') return value.toDate()
  if (typeof value.toMillis === 'function') return new Date(value.toMillis())
  if (typeof value === 'number') return new Date(value)

  if (typeof value === 'string') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }

  return null
}

export function firebaseTimestampToISOString(value) {
  return firebaseTimestampToDate(value)?.toISOString() || null
}
