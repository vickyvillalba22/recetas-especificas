'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Header } from './home/Header'

function readTheme() {
  try {
    return localStorage.getItem('sibo-theme') || 'light'
  } catch {
    return 'light'
  }
}

export function AppShell({ children }) {
  const router = useRouter()
  const pathname = usePathname()
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

  return (
    <>
      <Header
        theme={theme}
        mobileNavOpen={mobileNavOpen}
        onThemeToggle={toggleTheme}
        onMobileNavToggle={setMobileNavOpen}
        onCreateRecipe={() => router.push('/recetas?new=1')}
      />
      {children}
    </>
  )
}
