'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/providers/auth-provider'
import { cn } from '@/lib/utils'
import { Users, BookOpen, Music, LogOut, X } from 'lucide-react'

const navItems = [
  { href: '/pessoas', label: 'Pessoas', icon: Users },
  { href: '/fixa',   label: 'Fixas',   icon: BookOpen },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { instrutor, logout } = useAuth()

  return (
    <>
      {/* Backdrop — mobile only */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-gray-900 text-white transition-transform duration-300',
          // Desktop: sempre visível
          'lg:translate-x-0',
          // Mobile: controlado pelo estado
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-700">
          <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center shrink-0 border border-gray-700">
            <Music className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm flex-1">Gem Fixa</span>
          {/* Botão fechar — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-gray-800 text-white border border-gray-700'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-700 px-3 py-4">
          <div className="px-3 py-2 mb-1">
            <p className="text-xs text-gray-400">Conectado como</p>
            <p className="text-sm font-medium text-white truncate">
              {instrutor ? `${instrutor.nome} ${instrutor.sobrenome}` : '—'}
            </p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
