'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { Header } from './home/Header'

function readTheme() {
  try {
    return localStorage.getItem('sibo-theme') || 'light'
  } catch {
    return 'light'
  }
}

const protectedPaths = new Set(['/', '/recetas', '/diario', '/admin'])

function AppShellContent({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, isAdmin, logout } = useAuth()
  const [theme, setTheme] = useState(readTheme)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem('sibo-theme', theme)
    } catch {}
  }, [theme])

  useEffect(() => {
    setMobileNavOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!loading && !user && protectedPaths.has(pathname)) router.replace('/bienvenida')
    if (!loading && user && pathname === '/admin' && !isAdmin) router.replace('/')
  }, [isAdmin, loading, pathname, router, user])

  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return undefined

    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(hash.slice(1))
      if (!target) return
      const headerOffset = 96
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset
      window.scrollTo({ top, behavior: 'smooth' })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [pathname])

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))

  const handleLogout = async () => {
    try {
      await logout()
      router.replace('/bienvenida')
    } catch (error) {
      console.error('No se pudo cerrar la sesión:', error)
    }
  }

  const protectedRoute = protectedPaths.has(pathname)
  const adminUnauthorized = pathname === '/admin' && user && !isAdmin
  const shouldShowApp = !protectedRoute || (user && !adminUnauthorized)

  return (
    <>
      <Header
        theme={theme}
        mobileNavOpen={mobileNavOpen}
        onThemeToggle={toggleTheme}
        onMobileNavToggle={setMobileNavOpen}
        onCreateRecipe={() => router.push('/recetas?new=1')}
        user={user}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />
      {loading && protectedRoute ? <main className="grid min-h-[calc(100vh-88px)] place-items-center bg-cream text-sm text-ink/60 dark:bg-ink-dark dark:text-cream/60">Cargando sesión...</main> : shouldShowApp ? children : null}
    </>
  )
}

export function AppShell({ children }) {
  return <AuthProvider><AppShellContent>{children}</AppShellContent></AuthProvider>
}
