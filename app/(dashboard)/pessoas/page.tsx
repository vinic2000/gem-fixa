'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserPlus, ChevronLeft, ChevronRight, Search } from 'lucide-react'

interface Pessoa {
  id: string
  nome: string
  sobrenome: string
  tipo: 'aluno' | 'instrutor'
  celular: string | null
  telefone: string | null
  email: string | null
  instrumento: string | null
  comum_congregacao: string | null
}

interface PessoasResponse {
  data: Pessoa[]
  total: number
  page: number
  totalPages: number
  limit: number
}

const LIMIT = 10

export default function PessoasPage() {
  const router = useRouter()
  const [pessoas, setPessoas]     = useState<Pessoa[]>([])
  const [total, setTotal]         = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage]           = useState(1)
  const [tipo, setTipo]           = useState<string>('todos')
  const [search, setSearch]       = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading]     = useState(false)

  const fetchPessoas = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) })
      if (tipo !== 'todos') params.set('tipo', tipo)
      if (search)           params.set('search', search)
      const res = await apiFetch<PessoasResponse>(`/api/pessoas?${params}`)
      setPessoas(res.data)
      setTotal(res.total)
      setTotalPages(res.totalPages)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, tipo, search])

  useEffect(() => { fetchPessoas() }, [fetchPessoas])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  function handleTipoChange(val: string) {
    setTipo(val)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pessoas</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} {total === 1 ? 'registro' : 'registros'} encontrados
          </p>
        </div>
        <Button onClick={() => router.push('/pessoas/novo')} size="sm">
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo cadastro</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button type="submit" variant="outline" size="sm">Buscar</Button>
        </form>

        <div className="w-full sm:w-44">
          <Select value={tipo} onValueChange={handleTipoChange}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="aluno">Aluno</SelectItem>
              <SelectItem value="instrutor">Instrutor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Instrumento</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Congregação</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Contato</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">Carregando...</td>
              </tr>
            ) : pessoas.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">Nenhum registro encontrado</td>
              </tr>
            ) : (
              pessoas.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => router.push(`/pessoas/${p.id}`)}
                  className="border-b border-gray-50 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {p.nome} {p.sobrenome}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={p.tipo === 'instrutor' ? 'default' : 'secondary'}>
                      {p.tipo === 'instrutor' ? 'Instrutor' : 'Aluno'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.instrumento ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{p.comum_congregacao ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{p.celular ?? p.telefone ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-sm text-gray-500">
              Página {page} de {totalPages}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
