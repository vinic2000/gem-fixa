'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api'
import { Loader2, X } from 'lucide-react'

interface Congregacao {
  id: string
  nome: string
  cidade: string | null
}

interface Props {
  selectedId: string
  selectedNome: string
  onSelect: (id: string, nome: string) => void
  onClear: () => void
}

export function CongregacaoCombobox({ selectedId, selectedNome, onSelect, onClear }: Props) {
  const [inputValue, setInputValue]   = useState(selectedNome)
  const [suggestions, setSuggestions] = useState<Congregacao[]>([])
  const [open, setOpen]               = useState(false)
  const [loading, setLoading]         = useState(false)
  const containerRef                  = useRef<HTMLDivElement>(null)
  const debounceRef                   = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sincroniza input quando o pai altera o valor selecionado
  useEffect(() => {
    setInputValue(selectedNome)
  }, [selectedNome])

  // Fecha dropdown ao clicar fora e reverte o texto se nenhuma opção foi confirmada
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setInputValue(selectedNome)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [selectedNome])

  const fetchSuggestions = useCallback(async (search: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '10' })
      if (search) params.set('search', search)
      const res = await apiFetch<{ data: Congregacao[] }>(`/api/comum-congregacao?${params}`)
      setSuggestions(res.data)
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setInputValue(val)
    setOpen(true)
    if (!val) onClear()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => void fetchSuggestions(val), 250)
  }

  function handleFocus() {
    setOpen(true)
    void fetchSuggestions(inputValue)
  }

  // onMouseDown em vez de onClick para disparar antes do blur fechar o dropdown
  function handleSelect(c: Congregacao) {
    onSelect(c.id, c.nome)
    setInputValue(c.nome)
    setOpen(false)
    setSuggestions([])
  }

  function handleClear() {
    onClear()
    setInputValue('')
    setSuggestions([])
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder="Buscar congregação..."
          autoComplete="off"
        />
        {(inputValue || selectedId) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          ) : suggestions.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">Nenhuma congregação encontrada</p>
          ) : (
            suggestions.map((c) => (
              <button
                key={c.id}
                type="button"
                onMouseDown={() => handleSelect(c)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                  c.id === selectedId ? 'bg-gray-50 font-medium' : ''
                }`}
              >
                <span>{c.nome}</span>
                {c.cidade && <span className="text-xs text-gray-400">{c.cidade}</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
