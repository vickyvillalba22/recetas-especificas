'use client'

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase/client'
import { getCurrentUserId, runFirestoreOperation } from '../firestoreService'

export function saveHealthProfile(perfilSalud) {
  return runFirestoreOperation(
    async () => {
      const uid = getCurrentUserId()

      await setDoc(
        doc(db, 'users', uid),
        {
          perfilSalud,
          healthProfileUpdatedAt: serverTimestamp(),
        },
        { merge: true },
      )
    },
    'No se pudo guardar tu perfil de salud.',
  )
}

export function getHealthProfile() {
  return runFirestoreOperation(
    async () => {
      const uid = getCurrentUserId()
      const profileSnapshot = await getDoc(doc(db, 'users', uid))
      return profileSnapshot.data()?.perfilSalud || {}
    },
    'No se pudo cargar tu perfil de salud.',
  )
}
