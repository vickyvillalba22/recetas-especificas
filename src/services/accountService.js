'use client'

import { updatePassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase/client'
import { getCurrentUser, runFirestoreOperation } from './firestoreService'

export function updateAccountName(displayName) {
  return runFirestoreOperation(
    async () => {
      const user = getCurrentUser()
      const nextDisplayName = displayName.trim()

      await updateProfile(user, { displayName: nextDisplayName })
      await setDoc(doc(db, 'users', user.uid), { displayName: nextDisplayName }, { merge: true })
    },
    'No se pudo actualizar el nombre de tu cuenta.',
  )
}

export function updateAccountPassword(password) {
  return runFirestoreOperation(
    async () => {
      const user = getCurrentUser()
      await updatePassword(user, password)
    },
    'No se pudo actualizar la contraseña. Es posible que debas volver a iniciar sesión antes de intentarlo.',
  )
}

export function getAuthenticatedUser() {
  return auth.currentUser
}
