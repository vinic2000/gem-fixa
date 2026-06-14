'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/providers/auth-provider'
import { cn } from '@/lib/utils'
import { Users, BookOpen, Music, LogOut, X, Church } from 'lucide-react'

const navItems = [
  { href: '/pessoas',            label: 'Pessoas',      icon: Users },
  { href: '/fixa',               label: 'Fixas',        icon: BookOpen },
  { href: '/comum-congregacao',  label: 'Congregações', icon: Church },
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
          'fixed top-0 left-0 z-40 flex w-60 flex-col bg-white border-r border-gray-200 transition-transform duration-300',
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{ height: '100dvh' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <Music className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm text-gray-900 flex-1">GEM-FIXA</span>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-0.5">
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
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-indigo-600' : 'text-gray-400')} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div
          className="shrink-0 border-t border-gray-100 px-3 py-3"
          style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
        >
          <div className="px-3 py-2 mb-1">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Conectado como</p>
            <p className="text-sm font-medium text-gray-900 truncate mt-0.5">
              {instrutor ? `${instrutor.nome} ${instrutor.sobrenome}` : '—'}
            </p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0 text-gray-400" />
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
