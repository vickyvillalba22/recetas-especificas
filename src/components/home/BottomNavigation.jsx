'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookHeart, Home, PencilEdit, UserCircle } from '../ui/icons'

const navigationItems = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/recetas', label: 'Recetas', icon: BookHeart },
  { href: '/diario', label: 'Diario', icon: PencilEdit },
  { href: '/perfil', label: 'Mi perfil', icon: UserCircle },
]

function isItemActive(pathname, href) {
  if (href === '/') return pathname === '/'
  if (href === '/perfil') return pathname === '/perfil' || pathname === '/mis-recetas'
  return pathname === href
}

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav aria-label="Navegación principal" className="sticky bottom-6 z-40 mx-5 mb-3 rounded-full border border-ink/10 bg-white p-1 shadow-soft dark:border-sage/70 dark:bg-sage md:hidden">
      <div className="mx-auto grid grid-cols-4 pb-[env(safe-area-inset-bottom)]">
        {navigationItems.map(({ href, label, icon: Icon }) => {
          const active = isItemActive(pathname, href)

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex h-12 items-center justify-center px-1 text-[10px] font-bold transition ${active ? 'text-moss' : 'text-ink/45 hover:text-ink/75 dark:text-ink/55 dark:hover:text-ink'}`}
            >
              <span className={`grid h-9 w-12 place-items-center rounded-full transition ${active ? 'bg-sage dark:bg-moss/20' : ''}`}>
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
