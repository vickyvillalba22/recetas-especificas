'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { BookHeart, Home, PencilEdit, Sparkles, UserCircle } from '../ui/icons'

const navigationItems = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/recetas', label: 'Recetas', icon: BookHeart },
  { href: '/que-puedo-comer', label: '¿Qué puedo comer?', icon: Sparkles },
  { href: '/diario', label: 'Diario', icon: PencilEdit },
  { href: '/perfil', label: 'Mi perfil', icon: UserCircle },
]

function isItemActive(pathname, href) {
  if (href === '/') return pathname === '/'
  if (href === '/perfil') {
    return pathname === '/perfil' || pathname.startsWith('/perfil/') || pathname === '/mis-recetas' || pathname === '/recetas-favoritas'
  }
  return pathname === href
}

export function BottomNavigation() {
  const pathname = usePathname()
  const navigationRef = useRef(null)
  const [activeIndicator, setActiveIndicator] = useState(null)
  const activeIndex = navigationItems.findIndex(({ href }) => isItemActive(pathname, href))

  useEffect(() => {
    const links = navigationRef.current?.querySelectorAll('a')
    const activeLink = links?.[activeIndex]
    if (!activeLink) return

    setActiveIndicator({
      left: activeLink.offsetLeft + activeLink.offsetWidth / 2,
    })
  }, [activeIndex])

  return (
    <nav aria-label="Navegación principal" className="sticky bottom-6 z-40 mx-5 mb-3 rounded-full border border-ink/10 bg-white p-1 shadow-soft dark:border-sage/70 dark:bg-sage md:hidden">
      <div ref={navigationRef} className="relative mx-auto grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute top-[-10px] z-0 h-12 w-12 -translate-x-1/2 rounded-full bg-coral shadow-md shadow-coral/30 transition-[left,opacity] duration-300 ease-linear dark:border-sage ${
            activeIndicator ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ left: activeIndicator?.left || 0 }}
        />
        {navigationItems.map(({ href, label, icon: Icon }) => {
          const active = isItemActive(pathname, href)

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`relative z-10 flex h-12 items-center justify-center px-1 text-[10px] font-bold transition-transform duration-300 ease-linear ${active ? '-translate-y-[9px] text-white' : 'text-ink/45 hover:text-ink/75 dark:text-ink/55 dark:hover:text-ink'}`}
            >
              <span className="grid h-9 w-12 place-items-center rounded-full">
                <Icon size={25} />
              </span>
              <span className="sr-only">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
