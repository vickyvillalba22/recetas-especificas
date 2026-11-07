'use client'

import dynamic from 'next/dynamic'

const AppShell = dynamic(() => import('./AppShell').then((module) => module.AppShell), {
  ssr: false,
})

export function AppShellLoader({ children }) {
  return <AppShell>{children}</AppShell>
}
