'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { ThemeProvider } from '../context/ThemeContext'
import { BottomNavigation } from './home/BottomNavigation'
import { Header } from './home/Header'
import { LoadingScreen } from './ui/LoadingScreen'

const protectedPaths = new Set(['/recetas', '/mis-recetas', '/recetas-favoritas', '/diario', '/que-puedo-comer', '/perfil', '/perfil/editar', '/perfil/configurar-cuenta', '/perfil/historia-clinica', '/onboarding'])

function isAdminPath(pathname) {
  return pathname === '/admin' || pathname.startsWith('/admin/')
}

function AppShellContent({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, isAdmin } = useAuth()

  useEffect(() => {
    if (!loading && !user && (protectedPaths.has(pathname) || isAdminPath(pathname))) router.replace('/')
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

  const protectedRoute = protectedPaths.has(pathname) || isAdminPath(pathname)
  const adminUnauthorized = isAdminPath(pathname) && user && !isAdmin
  const shouldShowApp = !protectedRoute || (user && !adminUnauthorized)
  const isAuthPage = pathname === '/login' || pathname === '/registro'
  const isOnboardingPage = pathname === '/onboarding'
  const isWelcomePage = pathname === '/' && !user
  const showBottomNavigation = Boolean(user && !loading && !isAuthPage && !isOnboardingPage && shouldShowApp)

  return (
    <>
      {!isOnboardingPage && !isWelcomePage && (
        <Header
          user={user}
        />
      )}
      {loading && protectedRoute ? <LoadingScreen /> : shouldShowApp ? children : null}
      {showBottomNavigation && <BottomNavigation />}
    </>
  )
}

export function AppShell({ children }) {
  return <AuthProvider><ThemeProvider><AppShellContent>{children}</AppShellContent></ThemeProvider></AuthProvider>
}
