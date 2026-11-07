'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../lib/firebase/client'

const AuthContext = createContext(null)

async function ensureUserProfile(user) {
  const profileRef = doc(db, 'users', user.uid)
  const existingProfile = await getDoc(profileRef)
  const profileData = {
    uid: user.uid,
    displayName: user.displayName || '',
    email: user.email || '',
    photoURL: user.photoURL || '',
    lastLoginAt: serverTimestamp(),
  }

  if (!existingProfile.exists()) {
    profileData.role = 'user'
    profileData.createdAt = serverTimestamp()
  }

  await setDoc(profileRef, profileData, { merge: true })
  const savedProfile = await getDoc(profileRef)
  return savedProfile.data() || profileData
}

export function getAuthErrorMessage(error) {
  const messages = {
    'auth/invalid-credential': 'El email o la contraseña no son correctos.',
    'auth/invalid-email': 'El email no es válido.',
    'auth/email-already-in-use': 'Ya existe una cuenta con ese email.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/popup-closed-by-user': 'Se cerró la ventana de Google antes de completar el ingreso.',
    'auth/popup-blocked': 'El navegador bloqueó la ventana de Google. Permite ventanas emergentes e inténtalo de nuevo.',
    'auth/network-request-failed': 'No pudimos conectarnos. Revisa tu conexión e inténtalo de nuevo.',
  }

  return messages[error?.code] || error?.message || 'No pudimos completar la operación.'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (!active) return
      setLoading(true)
      setUser(nextUser)

      if (!nextUser) {
        setProfile(null)
        setRole(null)
        setLoading(false)
        return
      }

      try {
        const nextProfile = await ensureUserProfile(nextUser)
        const tokenResult = await nextUser.getIdTokenResult()
        if (active) {
          setProfile(nextProfile)
          setRole(tokenResult.claims.role || 'user')
        }
      } catch (error) {
        console.error('No se pudo guardar el perfil de Firebase:', error)
        if (active) {
          setProfile(null)
          setRole(null)
        }
      } finally {
        if (active) setLoading(false)
      }
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  async function refreshRole() {
    if (!auth.currentUser) return
    const tokenResult = await auth.currentUser.getIdTokenResult(true)
    setRole(tokenResult.claims.role || 'user')
  }

  const value = useMemo(() => ({
    user,
    profile,
    role,
    isAdmin: role === 'admin',
    loading,
    login: (email, password) => signInWithEmailAndPassword(auth, email, password),
    loginWithGoogle: () => signInWithPopup(auth, googleProvider),
    register: async (email, password, displayName) => {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      if (displayName) await updateProfile(result.user, { displayName })
      await ensureUserProfile(result.user)
      return result
    },
    logout: () => signOut(auth),
    refreshRole,
  }), [loading, profile, role, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe utilizarse dentro de AuthProvider.')
  return context
}
