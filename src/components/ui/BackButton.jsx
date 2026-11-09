'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from './icons'

export function BackButton({ label = 'Volver atrás', className = '' }) {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label={label}
      title={label}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink/70 transition hover:bg-white dark:border-cream/15 dark:text-cream/80 dark:hover:bg-ink-soft ${className}`}
    >
      <ArrowLeft size={18} />
    </button>
  )
}
