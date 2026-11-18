'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useState } from 'react'
import { BackButton } from '../ui/BackButton'
import { Leaf, UserCircle } from '../ui/icons'

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
const navigationItems = [
  { href: '/', label: 'Inicio' },
  { href: '/recetas', label: 'Recetas generales' },
  { href: '/que-puedo-comer', label: '¿Qué puedo comer?' },
  { href: '/diario', label: 'Diario' },
]

function isProfileSection(pathname) {
  return pathname === '/perfil' || pathname.startsWith('/perfil/') || pathname === '/mis-recetas' || pathname === '/recetas-favoritas'
}

export function Header({ user }) {
  const pathname = usePathname()
  const navRef = useRef(null)
  const [hoveredNav, setHoveredNav] = useState(null)
  const backLabel = backLabels[pathname] || (!knownPaths.has(pathname) ? 'Volver atrás' : '')
  const showNavigation = Boolean(user)
  const firstName = user?.displayName?.trim().split(/\s+/)[0] || ''
  const profileActive = isProfileSection(pathname)

  const moveNavIndicator = (index) => {
    const link = navRef.current?.querySelectorAll('a')[index]
    if (!link) return

    setHoveredNav({
      left: link.offsetLeft,
      width: link.offsetWidth,
    })
  }

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/90 backdrop-blur-sm dark:border-cream/10 dark:bg-ink-dark/85">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-5 py-4 sm:px-5 sm:py-5 lg:px-10">
        {backLabel ? <BackButton label={backLabel} /> : <Link className="flex items-center gap-3" href="/">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-moss text-cream"><Leaf size={21} strokeWidth={2.5} /></span>
          <span className="font-display text-xl font-semibold tracking-tight">sibo<span className="text-coral">.</span>decis</span>
        </Link>}
        {showNavigation && (
          <nav
            ref={navRef}
            onMouseLeave={() => setHoveredNav(null)}
            className="relative hidden items-center gap-8 text-sm font-medium text-ink/65 dark:text-cream/65 md:flex"
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute top-1/2 z-0 h-9 -translate-y-1/2 rounded-full bg-white/80 shadow-sm transition-[left,width,opacity] duration-300 ease-out dark:bg-ink-soft/80 ${
                hoveredNav ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                left: hoveredNav?.left || 0,
                width: hoveredNav?.width || 0,
              }}
            />
            {navigationItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => moveNavIndicator(index)}
                className="relative z-10 rounded-full px-3 py-2 transition-colors duration-200 hover:text-ink dark:hover:text-cream"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-2">
          {user && (
            <Link
              href="/perfil"
              className={`flex min-w-0 items-center gap-2 rounded-full px-4 py-1.5 transition ${
                profileActive
                  ? 'bg-sage text-moss dark:bg-moss/30 dark:text-sage'
                  : 'text-ink/70 hover:bg-white dark:text-cream/75 dark:hover:bg-ink-soft'
              }`}
              title="Ir a mi perfil"
              aria-label={firstName ? `Ir al perfil de ${firstName}` : 'Ir a mi perfil'}
              aria-current={profileActive ? 'page' : undefined}
            >
              {firstName && <span className="max-w-28 truncate text-sm font-semibold">{firstName}</span>}
              <UserCircle size={21} />
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
