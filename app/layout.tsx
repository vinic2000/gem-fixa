import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/providers/auth-provider'

export const metadata: Metadata = {
  title: 'Gem Fixa',
  description: 'Sistema de controle de aulas musicais',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full" suppressHydrationWarning>
      <body className="h-full bg-gray-50" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
