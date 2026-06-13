'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { getErrorMessage } from '@/lib/errors'

interface CongregacaoForm {
  nome: string
  endereco: string
  bairro: string
  cidade: string
  cep: string
}

const EMPTY: CongregacaoForm = {
  nome: '', endereco: '', bairro: '', cidade: '', cep: '',
}

export default function NovaCongregacaoPage() {
  const router = useRouter()
  const [form, setForm]       = useState<CongregacaoForm>(EMPTY)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  function set(field: keyof CongregacaoForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      await apiFetch('/api/comum-congregacao', { method: 'POST', body: JSON.stringify(form) })
      setSuccess('Congregação cadastrada com sucesso!')
      setTimeout(() => router.push('/comum-congregacao'), 1200)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erro ao salvar'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/comum-congregacao')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nova congregação</h1>
          <p className="text-sm text-gray-500">Preencha os dados para cadastrar uma nova congregação</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardHeader><CardTitle className="text-base">Dados principais</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={form.nome}
                onChange={(e) => set('nome', e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Endereço</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2 space-y-1.5">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={form.endereco}
                onChange={(e) => set('endereco', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                value={form.bairro}
                onChange={(e) => set('bairro', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={form.cidade}
                onChange={(e) => set('cidade', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={form.cep}
                onChange={(e) => set('cep', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {error   && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}
        {success && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">{success}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Cadastrar
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/comum-congregacao')}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
