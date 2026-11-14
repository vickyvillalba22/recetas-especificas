'use client'

import dynamic from 'next/dynamic'
import { useAuth } from '../context/AuthContext'
import { WelcomePage } from '../components/auth/WelcomePage'
import { LoadingScreen } from '../components/ui/LoadingScreen'

const HomePage = dynamic(() => import('./HomePageClient').then((module) => module.HomePage), {
  ssr: false,
  loading: () => <main className="min-h-screen bg-cream" />,
})

export default function Page() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />
  return user ? <HomePage /> : <WelcomePage />
}
