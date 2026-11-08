import './globals.css'
import { AppShellLoader } from '../components/AppShellLoader'

export const metadata = {
  title: {
    default: 'sibo.decis',
    template: '%s | sibo.decis',
  },
  description: 'Planificador de comidas bajas en FODMAP',
  applicationName: 'sibo.decis',
  icons: {
    icon: '/hugeicons--organic-food.svg',
    shortcut: '/hugeicons--organic-food.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-cream text-ink antialiased dark:bg-ink-dark dark:text-cream">
        <AppShellLoader>{children}</AppShellLoader>
      </body>
    </html>
  )
}
