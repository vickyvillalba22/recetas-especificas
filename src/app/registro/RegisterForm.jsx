'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getAuthErrorMessage, useAuth } from '../../context/AuthContext'

export function RegisterForm() {
  const router = useRouter()
  const { register, loginWithGoogle } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register(email.trim(), password, name.trim())
      router.replace('/')
    } catch (registerError) {
      setError(getAuthErrorMessage(registerError))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleRegister() {
    setLoading(true)
    setError('')
    try {
      await loginWithGoogle()
      router.replace('/')
    } catch (registerError) {
      setError(getAuthErrorMessage(registerError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-[calc(100vh-88px)] place-items-center bg-cream px-5 py-16 text-ink dark:bg-ink-dark dark:text-cream">
      <section className="w-full max-w-md rounded-3xl border border-ink/10 bg-white p-8 shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-coral">Nueva cuenta</p>
        <h1 className="mt-3 font-display text-3xl">Crear cuenta</h1>
        <p className="mt-2 text-sm text-ink/60 dark:text-cream/60">Crea tu cuenta para guardar tus datos de forma personal.</p>
        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <label className="block text-sm font-bold">Nombre<input className="field mt-2" type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Tu nombre" autoComplete="name" required /></label>
          <label className="block text-sm font-bold">Email<input className="field mt-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@email.com" autoComplete="email" required /></label>
          <label className="block text-sm font-bold">Contraseña<input className="field mt-2" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" autoComplete="new-password" minLength={6} required /></label>
          {error && <p className="rounded-xl bg-coral/10 p-3 text-sm text-coral">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-full bg-moss py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Creando cuenta...' : 'Registrarme'}</button>
        </form>
        <button type="button" onClick={handleGoogleRegister} disabled={loading} className="mt-3 w-full rounded-full border border-ink/15 py-3.5 text-sm font-bold text-ink/75 transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-60 dark:border-cream/15 dark:text-cream/80 dark:hover:bg-ink">Registrarme con Google</button>
        <div className="mt-6 flex flex-col gap-2 text-center text-sm">
          <Link className="font-semibold text-moss dark:text-sage" href="/login">¿Ya tienes cuenta? Inicia sesión</Link>
        </div>
      </section>
    </main>
  )
}
