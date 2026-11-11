'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { BookHeart, LogOut, Settings, UserCircle } from '../ui/icons'

function LogoutModal({ onClose, onConfirm, loading }) {
  return (
    <div
      onClick={(event) => event.target === event.currentTarget && !loading && onClose()}
      className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
        className="w-full max-w-sm rounded-3xl bg-cream p-6 shadow-2xl dark:bg-ink-soft dark:text-cream sm:p-8"
      >
        <span className="mb-4 inline-flex rounded-full bg-coral/10 p-3 text-coral">
          <LogOut size={20} />
        </span>
        <h2 id="logout-title" className="font-display text-2xl">
          ¿Seguro que querés cerrar sesión?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/60 dark:text-cream/60">
          Vas a salir de tu cuenta en este dispositivo.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            type="button"
            className="flex-1 rounded-full border border-ink/15 px-4 py-3 text-sm font-bold text-ink/70 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-cream/15 dark:text-cream/70 dark:hover:bg-ink"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            type="button"
            className="flex-1 rounded-full bg-coral px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Cerrando sesión...' : 'Cerrar sesión'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function ProfilePageClient() {
  const router = useRouter()
  const { user, profile, logout, isAdmin } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [error, setError] = useState('')

  const displayName = profile?.displayName || user?.displayName || 'Tu perfil'
  const email = profile?.email || user?.email || ''

  async function handleLogout() {
    setLoggingOut(true)
    setError('')
    try {
      await logout()
      router.replace('/bienvenida')
    } catch (logoutError) {
      setError(logoutError.message || 'No pudimos cerrar la sesión.')
      setLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream text-ink dark:bg-ink-dark dark:text-cream">
      <main className="mx-auto max-w-[1440px] px-5 pb-20 pt-10 lg:px-10 lg:pt-16">
        <section className="mx-auto max-w-2xl rounded-3xl border border-ink/10 bg-white p-6 shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark sm:p-10">
          <div className="flex items-start gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-sage text-moss dark:bg-moss/35 dark:text-sage">
              <UserCircle size={28} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-coral">Mi perfil</p>
              <h1 className="mt-2 truncate font-display text-3xl sm:text-4xl">{displayName}</h1>
              {email && <p className="mt-2 truncate text-sm text-ink/55 dark:text-cream/55">{email}</p>}
            </div>
          </div>

          <div className="mt-8 grid gap-3">
            {isAdmin && <Link href="/admin" className="flex items-center gap-4 rounded-2xl border border-moss/20 bg-sage/30 p-4 transition hover:border-moss/40 hover:bg-sage/50 dark:border-sage/20 dark:bg-moss/20 dark:hover:bg-moss/30">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-moss dark:bg-ink-soft dark:text-sage">
                <Settings size={22} />
              </span>
              <span>
                <strong className="block text-sm">Administración</strong>
                <span className="mt-1 block text-xs text-ink/55 dark:text-cream/55">Gestioná usuarios y recetas generales.</span>
              </span>
            </Link>}

            <Link href="/mis-recetas" className="flex items-center gap-4 rounded-2xl border border-ink/10 bg-cream p-4 transition hover:border-moss/30 hover:bg-sage/40 dark:border-cream/10 dark:bg-ink dark:hover:bg-moss/20">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-moss dark:bg-ink-soft dark:text-sage">
                <BookHeart size={22} />
              </span>
              <span>
                <strong className="block text-sm">Mis recetas</strong>
                <span className="mt-1 block text-xs text-ink/55 dark:text-cream/55">Consulta y administra tus recetas personales.</span>
              </span>
            </Link>

            <button type="button" onClick={() => setShowLogoutModal(true)} disabled={loggingOut} className="flex items-center gap-4 rounded-2xl border border-coral/20 p-4 text-left text-coral transition hover:bg-coral/10 disabled:cursor-not-allowed disabled:opacity-60">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-coral/10">
                <LogOut size={22} />
              </span>
              <span>
                <strong className="block text-sm">{loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}</strong>
                <span className="mt-1 block text-xs text-coral/70">Salir de tu cuenta en este dispositivo.</span>
              </span>
            </button>
          </div>

          {error && <p className="mt-4 rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p>}
        </section>
      </main>
      {showLogoutModal && <LogoutModal onClose={() => setShowLogoutModal(false)} onConfirm={handleLogout} loading={loggingOut} />}
    </div>
  )
}
