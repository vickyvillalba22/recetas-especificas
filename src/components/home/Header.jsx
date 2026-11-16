'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BackButton } from '../ui/BackButton'
import { Leaf, Moon, Sun } from '../ui/icons'

const backLabels = {
  '/admin': 'Volver al inicio',
  '/admin/recetas': 'Volver al panel',
  '/login': 'Volver al inicio',
  '/mis-recetas': 'Volver al perfil',
  '/recetas-favoritas': 'Volver al perfil',
  '/registro': 'Volver al inicio',
  '/perfil/historia-clinica': 'Volver al perfil',
}

const knownPaths = new Set(['/', '/admin', '/admin/recetas', '/diario', '/login', '/mis-recetas', '/perfil', '/que-puedo-comer', '/recetas', '/recetas-favoritas', '/registro'])

export function Header({ theme, onThemeToggle, user, isAdmin }) {
  const pathname = usePathname()
  const backLabel = backLabels[pathname] || (!knownPaths.has(pathname) ? 'Volver atrás' : '')
  const showNavigation = Boolean(user)
  const firstName = user?.displayName?.trim().split(/\s+/)[0] || ''

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/90 backdrop-blur-sm dark:border-cream/10 dark:bg-ink-dark/85">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-5 py-4 sm:px-5 sm:py-5 lg:px-10">
        {backLabel ? <BackButton label={backLabel} /> : <Link className="flex items-center gap-3" href="/">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-moss text-cream"><Leaf size={21} strokeWidth={2.5} /></span>
          <span className="font-display text-xl font-semibold tracking-tight">sibo<span className="text-coral">.</span>decis</span>
        </Link>}
        {showNavigation && (
          <nav className="hidden items-center gap-8 text-sm font-medium text-ink/65 dark:text-cream/65 md:flex">
            <Link href="/">Inicio</Link>
            <Link href="/recetas">Recetas generales</Link>
            <Link href="/que-puedo-comer">¿Qué puedo comer?</Link>
            <Link href="/diario">Diario</Link>
            {user && <Link href="/perfil">Mi perfil</Link>}
          </nav>
        )}
        <div className="flex items-center gap-2">
          {firstName && <span className="max-w-28 truncate text-sm font-semibold text-ink/70 dark:text-cream/75">{firstName}</span>}
          <button onClick={onThemeToggle} className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 text-ink/70 transition hover:bg-white dark:border-cream/15 dark:text-cream/80 dark:hover:bg-ink-soft" aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
        </div>
      </div>
    </header>
  )
}
