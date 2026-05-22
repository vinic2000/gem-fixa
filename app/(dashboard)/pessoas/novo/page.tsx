'use client'

// Esta rota estática tem prioridade sobre [id].
// Renderiza o formulário de criação diretamente.
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { getErrorMessage } from '@/lib/errors'

interface PessoaForm {
  nome: string; sobrenome: string; tipo: string; email: string
  responsavel: string; telefone: string; celular: string; endereco: string
  bairro: string; cidade: string; cep: string; comum_congregacao: string
  instrumento: string; senha: string
}

const EMPTY: PessoaForm = {
  nome: '', sobrenome: '', tipo: 'aluno', email: '', responsavel: '',
  telefone: '', celular: '', endereco: '', bairro: '', cidade: '', cep: '',
  comum_congregacao: '', instrumento: '', senha: '',
}

export default function NovaPessoaPage() {
  const router = useRouter()
  const [form, setForm]       = useState<PessoaForm>(EMPTY)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  function set(field: keyof PessoaForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const payload: Record<string, string> = { ...form }
      if (!payload.senha) delete payload.senha
      await apiFetch('/api/pessoas', { method: 'POST', body: JSON.stringify(payload) })
      setSuccess('Pessoa cadastrada com sucesso!')
      setTimeout(() => router.push('/pessoas'), 1200)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erro ao salvar'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/pessoas')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo cadastro</h1>
          <p className="text-sm text-gray-500">Preencha os dados para cadastrar uma nova pessoa</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardHeader><CardTitle className="text-base">Dados principais</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={(e) => set('nome', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Sobrenome *</Label>
              <Input value={form.sobrenome} onChange={(e) => set('sobrenome', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo *</Label>
              <Select value={form.tipo} onValueChange={(v) => set('tipo', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aluno">Aluno</SelectItem>
                  <SelectItem value="instrutor">Instrutor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Instrumento</Label>
              <Input value={form.instrumento} onChange={(e) => set('instrumento', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Responsável</Label>
              <Input value={form.responsavel} onChange={(e) => set('responsavel', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Contato</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <Input value={form.telefone} onChange={(e) => set('telefone', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Celular</Label>
              <Input value={form.celular} onChange={(e) => set('celular', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Endereço</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2 space-y-1.5">
              <Label>Endereço</Label>
              <Input value={form.endereco} onChange={(e) => set('endereco', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Bairro</Label>
              <Input value={form.bairro} onChange={(e) => set('bairro', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Cidade</Label>
              <Input value={form.cidade} onChange={(e) => set('cidade', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>CEP</Label>
              <Input value={form.cep} onChange={(e) => set('cep', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Congregação</Label>
              <Input value={form.comum_congregacao} onChange={(e) => set('comum_congregacao', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {form.tipo === 'instrutor' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Senha</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1.5 max-w-sm">
              <Label>Senha *</Label>
              <Input
                type="password"
                placeholder="Digite a senha"
                value={form.senha}
                onChange={(e) => set('senha', e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>
        )}

        {error   && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}
        {success && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">{success}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Cadastrar
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/pessoas')}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
