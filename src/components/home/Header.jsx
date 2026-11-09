'use client'

import Link from 'next/link'
import { Leaf, Moon, Sun } from '../ui/icons'

export function Header({ theme, onThemeToggle, user, isAdmin }) {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/90 backdrop-blur-sm dark:border-cream/10 dark:bg-ink-dark/85">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-4 sm:px-5 sm:py-5 lg:px-10">
        <Link className="flex items-center gap-3" href="/">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-moss text-cream"><Leaf size={21} strokeWidth={2.5} /></span>
          <span className="font-display text-xl font-semibold tracking-tight">sibo<span className="text-coral">.</span>decis</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink/65 dark:text-cream/65 md:flex">
          <Link href="/">Inicio</Link>
          <Link href="/recetas">Recetas generales</Link>
          <Link href="/diario">Diario</Link>
          {user && <Link href="/perfil">Mi perfil</Link>}
          {isAdmin && <Link href="/admin">Admin</Link>}
          {!user && <Link href="/login">Ingresar</Link>}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={onThemeToggle} className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 text-ink/70 transition hover:bg-white dark:border-cream/15 dark:text-cream/80 dark:hover:bg-ink-soft" aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
        </div>
      </div>
    </header>
  )
}
