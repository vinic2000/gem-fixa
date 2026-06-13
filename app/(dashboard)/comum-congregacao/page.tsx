'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, Search, PlusCircle, Church } from 'lucide-react'
import { getErrorMessage } from '@/lib/errors'

interface ComumCongregacao {
  id: string
  nome: string
  endereco: string | null
  bairro: string | null
  cidade: string | null
  cep: string | null
}

interface ComumCongregacaoResponse {
  data: ComumCongregacao[]
  total: number
  page: number
  totalPages: number
  limit: number
}

const LIMIT = 10

export default function ComumCongregacaoPage() {
  const router = useRouter()
  const [congregacoes, setCongregacoes] = useState<ComumCongregacao[]>([])
  const [total, setTotal]               = useState(0)
  const [totalPages, setTotalPages]     = useState(1)
  const [page, setPage]                 = useState(1)
  const [search, setSearch]             = useState('')
  const [searchInput, setSearchInput]   = useState('')
  const [loading, setLoading]           = useState(false)

  useEffect(() => {
    let isCancelled = false

    async function load() {
      setLoading(true)
      try {
        const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) })
        if (search) params.set('search', search)
        const res = await apiFetch<ComumCongregacaoResponse>(`/api/comum-congregacao?${params}`)
        if (isCancelled) return
        setCongregacoes(res.data)
        setTotal(res.total)
        setTotalPages(res.totalPages)
      } catch (err: unknown) {
        console.error(getErrorMessage(err, 'Falha ao carregar congregações'))
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }

    void load()
    return () => { isCancelled = true }
  }, [page, search])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Congregações</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} {total === 1 ? 'registro' : 'registros'} encontrados
          </p>
        </div>
        <Button onClick={() => router.push('/comum-congregacao/novo')} size="sm">
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Nova congregação</span>
          <span className="sm:hidden">Nova</span>
        </Button>
      </div>

      {/* Filtro */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
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

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Endereço</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bairro</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cidade</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">CEP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-3.5">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${55 + (i % 3) * 15}%` }} />
                    </td>
                  </tr>
                ))
              ) : congregacoes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Church className="w-8 h-8 text-gray-300" />
                      <span className="text-sm">Nenhum registro encontrado</span>
                    </div>
                  </td>
                </tr>
              ) : (
                congregacoes.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => router.push(`/comum-congregacao/${c.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3.5 font-medium text-gray-900">{c.nome}</td>
                    <td className="px-4 py-3.5 text-gray-500">{c.endereco ?? '—'}</td>
                    <td className="px-4 py-3.5 text-gray-500">{c.bairro ?? '—'}</td>
                    <td className="px-4 py-3.5 text-gray-500">{c.cidade ?? '—'}</td>
                    <td className="px-4 py-3.5 text-gray-500">{c.cep ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/60">
            <p className="text-sm text-gray-500">
              Página <span className="font-medium text-gray-700">{page}</span> de {totalPages}
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
