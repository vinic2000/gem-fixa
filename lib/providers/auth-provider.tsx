'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { setTokens, clearTokens, getTokens } from '@/lib/api'

interface Instrutor {
  id: string
  nome: string
  sobrenome: string
}

interface AuthContextType {
  instrutor: Instrutor | null
  isLoading: boolean
  login: (email: string, senha: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [instrutor, setInstrutor] = useState<Instrutor | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const { accessToken } = getTokens()
    const stored = localStorage.getItem('instrutor')
    if (accessToken && stored) {
      try {
        setInstrutor(JSON.parse(stored) as Instrutor)
      } catch {
        clearTokens()
      }
    }
    setIsLoading(false)
  }, [])

  async function login(email: string, senha: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error ?? 'Erro ao fazer login')
    }

    const data = await res.json()
    setTokens(data.accessToken, data.refreshToken)
    localStorage.setItem('instrutor', JSON.stringify(data.instrutor))
    setInstrutor(data.instrutor)
    router.push('/pessoas')
  }

  function logout() {
    clearTokens()
    localStorage.removeItem('instrutor')
    setInstrutor(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ instrutor, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
