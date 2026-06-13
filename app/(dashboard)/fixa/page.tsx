'use client'

import { useEffect, useState, useRef } from 'react'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, ChevronLeft, ChevronRight, Loader2, BookOpen } from 'lucide-react'
import { getErrorMessage } from '@/lib/errors'

interface Aluno { id: string; nome: string; sobrenome: string }
interface FixaRow {
  id: string
  aluno_id: string
  data_aula: string
  numero_pagina: number | null
  numero_licao: number | null
  tipo_aula: 'teorica' | 'pratica'
}
interface FixaResponse { data: FixaRow[]; total: number; page: number; totalPages: number }

const LIMIT = 10
const today = () => new Date().toISOString().split('T')[0]

export default function FixaPage() {
  // Busca de aluno
  const [searchAluno, setSearchAluno]   = useState('')
  const [alunos, setAlunos]             = useState<Aluno[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedAluno, setSelectedAluno]     = useState<Aluno | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // Tabela de fixas
  const [fixas, setFixas]       = useState<FixaRow[]>([])
  const [total, setTotal]       = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage]         = useState(1)
  const [loadingFixas, setLoadingFixas] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')

  // Modal de adição
  const [modalOpen, setModalOpen] = useState(false)
  const [novaFixa, setNovaFixa]   = useState({
    data_aula:    today(),
    numero_pagina: '',
    numero_licao:  '',
    tipo_aula:     '',
  })
  const [savingFixa, setSavingFixa] = useState(false)
  const [modalError, setModalError] = useState('')

  // Busca sugestões de alunos conforme o usuário digita
  useEffect(() => {
    if (searchAluno.trim().length < 2) return
    const timer = setTimeout(async () => {
      try {
        const res = await apiFetch<{ data: Aluno[] }>(
          `/api/pessoas?tipo=aluno&search=${encodeURIComponent(searchAluno)}&limit=8`
        )
        setAlunos(res.data)
        setShowSuggestions(true)
      } catch { setAlunos([]) }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchAluno])

  // Fecha sugestões ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function fetchFixas() {
    if (!selectedAluno) return
    setLoadingFixas(true)
    try {
      const params = new URLSearchParams({
        aluno_id: selectedAluno.id,
        page:     String(page),
        limit:    String(LIMIT),
      })
      if (filtroTipo !== 'todos') params.set('tipo_aula', filtroTipo)
      const res = await apiFetch<FixaResponse>(`/api/fixa?${params}`)
      setFixas(res.data)
      setTotal(res.total)
      setTotalPages(res.totalPages)
    } catch {
      setFixas([])
    } finally {
      setLoadingFixas(false)
    }
  }

  useEffect(() => {
    let isCancelled = false

    async function loadFixas() {
      if (!selectedAluno) return
      setLoadingFixas(true)
      try {
        const params = new URLSearchParams({
          aluno_id: selectedAluno.id,
          page: String(page),
          limit: String(LIMIT),
        })
        if (filtroTipo !== 'todos') params.set('tipo_aula', filtroTipo)
        const res = await apiFetch<FixaResponse>(`/api/fixa?${params}`)
        if (isCancelled) return
        setFixas(res.data)
        setTotal(res.total)
        setTotalPages(res.totalPages)
      } catch {
        if (!isCancelled) setFixas([])
      } finally {
        if (!isCancelled) setLoadingFixas(false)
      }
    }

    void loadFixas()
    return () => {
      isCancelled = true
    }
  }, [selectedAluno, page, filtroTipo])

  function selectAluno(a: Aluno) {
    setSelectedAluno(a)
    setSearchAluno(`${a.nome} ${a.sobrenome}`)
    setShowSuggestions(false)
    setPage(1)
  }

  function handleFiltroTipo(val: string) {
    setFiltroTipo(val)
    setPage(1)
  }

  async function handleDeleteFixa(id: string) {
    try {
      await apiFetch(`/api/fixa/${id}`, { method: 'DELETE' })
      fetchFixas()
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Erro ao excluir'))
    }
  }

  function openModal() {
    setNovaFixa({ data_aula: today(), numero_pagina: '', numero_licao: '', tipo_aula: '' })
    setModalError('')
    setModalOpen(true)
  }

  async function handleSaveFixa(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedAluno) return
    if (!novaFixa.tipo_aula) { setModalError('Selecione o tipo de aula'); return }
    setSavingFixa(true)
    setModalError('')
    try {
      await apiFetch('/api/fixa', {
        method: 'POST',
        body: JSON.stringify({
          aluno_id:     selectedAluno.id,
          data_aula:    novaFixa.data_aula,
          numero_pagina: novaFixa.numero_pagina ? parseInt(novaFixa.numero_pagina) : null,
          numero_licao:  novaFixa.numero_licao  ? parseInt(novaFixa.numero_licao)  : null,
          tipo_aula:    novaFixa.tipo_aula,
        }),
      })
      setModalOpen(false)
      fetchFixas()
    } catch (err: unknown) {
      setModalError(getErrorMessage(err, 'Erro ao salvar'))
    } finally {
      setSavingFixa(false)
    }
  }

  function handleNumericInput(field: 'numero_pagina' | 'numero_licao', value: string) {
    const onlyDigits = value.replace(/\D/g, '')
    setNovaFixa((prev) => ({ ...prev, [field]: onlyDigits }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Fixas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Histórico de aulas por aluno</p>
        </div>
        {selectedAluno && (
          <Button onClick={openModal} size="sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Adicionar registro</span>
            <span className="sm:hidden">Adicionar</span>
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
        <div className="flex-1">
        <Label className="mb-1.5 block">Buscar aluno</Label>
        <div className="relative" ref={searchRef}>
          <Input
            placeholder="Digite o nome do aluno..."
            value={searchAluno}
            onChange={(e) => {
              setSearchAluno(e.target.value)
              if (!e.target.value) { setSelectedAluno(null); setFixas([]) }
            }}
            onFocus={() => alunos.length > 0 && setShowSuggestions(true)}
          />
          {showSuggestions && alunos.length > 0 && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              {alunos.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 hover:text-gray-900 transition-colors border-b border-gray-50 last:border-0"
                  onMouseDown={() => selectAluno(a)}
                >
                  {a.nome} {a.sobrenome}
                </button>
              ))}
            </div>
          )}
          {showSuggestions && alunos.length === 0 && searchAluno.length >= 2 && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-sm text-gray-500">
              Nenhum aluno encontrado
            </div>
          )}
        </div>
        </div>

        <div className="w-full sm:w-52">
          <Label className="mb-1.5 block">Tipo de aula</Label>
          <Select value={filtroTipo} onValueChange={handleFiltroTipo}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="pratica">Aula prática</SelectItem>
              <SelectItem value="teorica">Aula teórica</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabela de fixas */}
      {selectedAluno && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Aulas de <strong className="text-gray-900">{selectedAluno.nome} {selectedAluno.sobrenome}</strong>
            </span>
            <span className="text-xs text-gray-400 font-medium">{total} {total === 1 ? 'registro' : 'registros'}</span>
          </div>

          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[420px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data da aula</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Página</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lição</th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loadingFixas ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-3.5">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${50 + (i % 3) * 15}%` }} />
                    </td>
                  </tr>
                ))
              ) : fixas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <BookOpen className="w-8 h-8 text-gray-300" />
                      <span className="text-sm">Nenhuma aula registrada</span>
                    </div>
                  </td>
                </tr>
              ) : (
                fixas.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5 text-gray-900">
                      {new Date(f.data_aula + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={f.tipo_aula === 'pratica' ? 'success' : 'secondary'}>
                        {f.tipo_aula === 'pratica' ? 'Prática' : 'Teórica'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500">{f.numero_pagina ?? '—'}</td>
                    <td className="px-4 py-3.5 text-gray-500">{f.numero_licao ?? '—'}</td>
                    <td className="px-4 py-3.5">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir registro</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir esta aula? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteFixa(f.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/60">
              <p className="text-sm text-gray-500">Página <span className="font-medium text-gray-700">{page}</span> de {totalPages}</p>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedAluno && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center h-48 gap-2 text-gray-400">
          <BookOpen className="w-8 h-8 text-gray-300" />
          <p className="text-sm">Busque um aluno para visualizar as aulas</p>
        </div>
      )}

      {/* Modal de nova fixa */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar aula</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveFixa} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Data da aula</Label>
              <Input
                type="date"
                value={novaFixa.data_aula}
                readOnly
                className="bg-gray-50 cursor-default"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nº Página</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="Ex: 42"
                  value={novaFixa.numero_pagina}
                  onChange={(e) => handleNumericInput('numero_pagina', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Nº Lição</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="Ex: 7"
                  value={novaFixa.numero_licao}
                  onChange={(e) => handleNumericInput('numero_licao', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de aula *</Label>
              <Select value={novaFixa.tipo_aula} onValueChange={(v) => setNovaFixa((p) => ({ ...p, tipo_aula: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pratica">Aula prática</SelectItem>
                  <SelectItem value="teorica">Aula teórica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {modalError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {modalError}
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={savingFixa}>
                {savingFixa ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
