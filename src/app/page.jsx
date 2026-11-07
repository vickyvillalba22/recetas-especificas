'use client'

import dynamic from 'next/dynamic'

const HomePage = dynamic(() => import('./HomePageClient').then((module) => module.HomePage), {
  ssr: false,
  loading: () => <main className="min-h-screen bg-cream" />,
})

export default function Page() {
  return <HomePage />
}
