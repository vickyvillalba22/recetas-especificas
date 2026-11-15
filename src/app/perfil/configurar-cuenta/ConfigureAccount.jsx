'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getAuthErrorMessage, useAuth } from '../../../context/AuthContext'
import { updateAccountName, updateAccountPassword } from '../../../services/accountService'

export function ConfigureAccount() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.displayName || user?.displayName || '')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [nameMessage, setNameMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [nameError, setNameError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  async function handleNameSubmit(event) {
    event.preventDefault()
    if (savingName) return

    const nextName = displayName.trim()
    if (!nextName) {
      setNameError('El nombre de cuenta no puede estar vacío.')
      return
    }

    setSavingName(true)
    setNameError('')
    setNameMessage('')

    try {
      await updateAccountName(nextName)
      await refreshProfile()
      setDisplayName(nextName)
      setNameMessage('El nombre de tu cuenta se actualizó correctamente.')
    } catch (error) {
      setNameError(getAuthErrorMessage(error))
    } finally {
      setSavingName(false)
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()
    if (savingPassword) return

    if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (password !== passwordConfirmation) {
      setPasswordError('Las contraseñas no coinciden.')
      return
    }

    setSavingPassword(true)
    setPasswordError('')
    setPasswordMessage('')

    try {
      await updateAccountPassword(password)
      setPassword('')
      setPasswordConfirmation('')
      setPasswordMessage('La contraseña se actualizó correctamente.')
    } catch (error) {
      setPasswordError(getAuthErrorMessage(error))
    } finally {
      setSavingPassword(false)
    }
  }

  if (authLoading) return null
  if (!user) return null

  return (
    <main className="min-h-screen bg-cream px-5 pb-20 pt-10 text-ink dark:bg-ink-dark dark:text-cream sm:pt-16">
      <section className="mx-auto w-full max-w-2xl">
        <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-coral">Cuenta</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">Configurar cuenta</h1>
        <p className="mt-2 text-sm text-ink/60 dark:text-cream/60">
          Desde acá podés actualizar tus datos de acceso. El email no se puede modificar.
        </p>

        <section className="mt-8 rounded-3xl border border-ink/10 bg-white p-6 shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark sm:p-10">
          <label className="block text-sm font-bold">
            Email
            <input className="field mt-2 opacity-60" type="email" value={user.email || ''} disabled readOnly />
          </label>
        </section>

        <section className="mt-6 rounded-3xl border border-ink/10 bg-white p-6 shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark sm:p-10">
          <h2 className="font-display text-2xl">Nombre de cuenta</h2>
          <p className="mt-2 text-sm text-ink/60 dark:text-cream/60">
            Es el nombre general asociado a tu cuenta.
          </p>
          <form onSubmit={handleNameSubmit} className="mt-6">
            <label className="block text-sm font-bold">
              Nombre
              <input
                className="field mt-2"
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={80}
                autoComplete="name"
                required
              />
            </label>
            {nameError && <p className="mt-4 rounded-xl bg-coral/10 p-3 text-sm text-coral">{nameError}</p>}
            {nameMessage && <p className="mt-4 rounded-xl bg-moss/10 p-3 text-sm text-moss dark:text-sage">{nameMessage}</p>}
            <button
              type="submit"
              disabled={savingName}
              className="mt-6 rounded-full bg-moss px-6 py-3 text-sm font-bold text-white transition hover:bg-moss/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingName ? 'Guardando...' : 'Guardar nombre'}
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-3xl border border-ink/10 bg-white p-6 shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark sm:p-10">
          <h2 className="font-display text-2xl">Contraseña</h2>
          <p className="mt-2 text-sm text-ink/60 dark:text-cream/60">
            Usá una contraseña de al menos 6 caracteres.
          </p>
          <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-bold">
              Nueva contraseña
              <input
                className="field mt-2"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                autoComplete="new-password"
                required
              />
            </label>
            <label className="block text-sm font-bold">
              Repetir nueva contraseña
              <input
                className="field mt-2"
                type="password"
                value={passwordConfirmation}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
                minLength={6}
                autoComplete="new-password"
                required
              />
            </label>
            {passwordError && <p className="rounded-xl bg-coral/10 p-3 text-sm text-coral">{passwordError}</p>}
            {passwordMessage && <p className="rounded-xl bg-moss/10 p-3 text-sm text-moss dark:text-sage">{passwordMessage}</p>}
            <button
              type="submit"
              disabled={savingPassword}
              className="rounded-full bg-moss px-6 py-3 text-sm font-bold text-white transition hover:bg-moss/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingPassword ? 'Actualizando...' : 'Cambiar contraseña'}
            </button>
          </form>
        </section>
      </section>
    </main>
  )
}
