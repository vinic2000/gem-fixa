'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/providers/auth-provider'
import { Sidebar } from '@/components/layout/Sidebar'
import { Menu, Music } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { instrutor, isLoading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !instrutor) {
      router.replace('/login')
    }
  }, [instrutor, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-sm">Carregando...</div>
      </div>
    )
  }

  if (!instrutor) return null

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Área principal */}
      <div className="flex flex-1 flex-col lg:ml-60 min-w-0">

        {/* Header mobile */}
        <header className="sticky top-0 z-20 flex items-center gap-3 bg-white border-b border-gray-200 px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-800 rounded-md border border-gray-700 flex items-center justify-center">
              <Music className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-sm text-gray-900">Gem Fixa</span>
          </div>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
