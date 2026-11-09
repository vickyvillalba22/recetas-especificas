'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { BottomNavigation } from './home/BottomNavigation'
import { Header } from './home/Header'

function readTheme() {
  try {
    return localStorage.getItem('sibo-theme') || 'light'
  } catch {
    return 'light'
  }
}

const protectedPaths = new Set(['/', '/recetas', '/mis-recetas', '/diario', '/perfil'])

function isAdminPath(pathname) {
  return pathname === '/admin' || pathname.startsWith('/admin/')
}

function AppShellContent({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, isAdmin } = useAuth()
  const [theme, setTheme] = useState(readTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem('sibo-theme', theme)
    } catch {}
  }, [theme])

  useEffect(() => {
    if (!loading && !user && (protectedPaths.has(pathname) || isAdminPath(pathname))) router.replace('/bienvenida')
    if (!loading && user && isAdminPath(pathname) && !isAdmin) router.replace('/')
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

  const protectedRoute = protectedPaths.has(pathname) || isAdminPath(pathname)
  const adminUnauthorized = isAdminPath(pathname) && user && !isAdmin
  const shouldShowApp = !protectedRoute || (user && !adminUnauthorized)
  const isAuthPage = pathname === '/bienvenida' || pathname === '/login' || pathname === '/registro'
  const showBottomNavigation = Boolean(user && !loading && !isAuthPage && shouldShowApp)

  return (
    <>
      <Header
        theme={theme}
        onThemeToggle={toggleTheme}
        user={user}
        isAdmin={isAdmin}
      />
      {loading && protectedRoute ? <main className="grid min-h-[calc(100vh-88px)] place-items-center bg-cream text-sm text-ink/60 dark:bg-ink-dark dark:text-cream/60">Cargando sesión...</main> : shouldShowApp ? children : null}
      {showBottomNavigation && <BottomNavigation />}
    </>
  )
}

export function AppShell({ children }) {
  return <AuthProvider><AppShellContent>{children}</AppShellContent></AuthProvider>
}
