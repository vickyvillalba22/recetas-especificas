'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Leaf, Menu, Moon, Plus, Sun } from '../ui/icons'

export function Header({ theme, mobileNavOpen, onThemeToggle, onMobileNavToggle, onCreateRecipe, user, isAdmin, onLogout }) {
  const pathname = usePathname()
  const closeMobileNav = () => onMobileNavToggle(false)
  const homePath = pathname === '/' ? '' : '/'

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/90 backdrop-blur-sm dark:border-cream/10 dark:bg-ink-dark/85">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-4 sm:px-5 sm:py-5 lg:px-10">
        <Link className="flex items-center gap-3" href="/">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-moss text-cream"><Leaf size={21} strokeWidth={2.5} /></span>
          <span className="font-display text-xl font-semibold tracking-tight">sibo<span className="text-coral">.</span>decis</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink/65 dark:text-cream/65 md:flex">
          <Link className="text-moss dark:text-sun" href={`${homePath}#menu`}>Mi menú</Link>
          <Link href={`${homePath}#compras`}>Lista de compras</Link>
          <Link href="/recetas">Mis recetas</Link>
          <Link href="/diario">Diario</Link>
          {isAdmin && <Link href="/admin">Admin</Link>}
          {user ? <button onClick={onLogout} type="button" className="hover:text-coral">Cerrar sesión</button> : <Link href="/login">Ingresar</Link>}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={onThemeToggle} className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 text-ink/70 transition hover:bg-white dark:border-cream/15 dark:text-cream/80 dark:hover:bg-ink-soft" aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button onClick={() => onMobileNavToggle(!mobileNavOpen)} className="rounded-full border border-ink/15 p-2 text-ink/70 dark:border-cream/15 dark:text-cream/80 md:hidden" aria-label="Abrir menú" aria-expanded={mobileNavOpen}><Menu size={20} /></button>
          <button onClick={onCreateRecipe} className="hidden items-center gap-2 rounded-full bg-coral px-5 py-3 text-sm font-bold text-white shadow-lg shadow-coral/20 transition hover:bg-[#d9624c] sm:flex"><Plus size={16} /> Agregar receta</button>
        </div>
      </div>
      {mobileNavOpen && <nav className="border-t border-ink/10 bg-cream px-4 py-4 dark:border-cream/10 dark:bg-ink-dark md:hidden"><div className="mx-auto flex max-w-[1440px] flex-col gap-1 text-sm font-semibold">
        <Link onClick={closeMobileNav} className="rounded-xl px-3 py-3 text-moss hover:bg-white dark:hover:bg-ink-soft" href={`${homePath}#menu`}>Mi menú</Link>
        <Link onClick={closeMobileNav} className="rounded-xl px-3 py-3 hover:bg-white dark:hover:bg-ink-soft" href={`${homePath}#compras`}>Lista de compras</Link>
        <Link onClick={closeMobileNav} className="rounded-xl px-3 py-3 hover:bg-white dark:hover:bg-ink-soft" href="/recetas">Mis recetas</Link>
        <Link onClick={closeMobileNav} className="rounded-xl px-3 py-3 hover:bg-white dark:hover:bg-ink-soft" href="/diario">Diario</Link>
        {isAdmin && <Link onClick={closeMobileNav} className="rounded-xl px-3 py-3 hover:bg-white dark:hover:bg-ink-soft" href="/admin">Admin</Link>}
        {user ? <button onClick={() => { closeMobileNav(); onLogout() }} type="button" className="rounded-xl px-3 py-3 text-left hover:bg-white dark:hover:bg-ink-soft">Cerrar sesión</button> : <Link onClick={closeMobileNav} className="rounded-xl px-3 py-3 hover:bg-white dark:hover:bg-ink-soft" href="/login">Ingresar</Link>}
        <button onClick={onThemeToggle} className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-ink/10 px-3 py-3 text-ink/80 dark:border-cream/15 dark:text-cream/80">{theme === 'dark' ? <><Sun size={16} /> Modo claro</> : <><Moon size={16} /> Modo oscuro</>}</button>
        <button onClick={() => { closeMobileNav(); onCreateRecipe() }} className="mt-2 flex items-center justify-center gap-2 rounded-full bg-coral px-5 py-3 font-bold text-white"><Plus size={16} /> Agregar receta</button>
      </div></nav>}
    </header>
  )
}
