'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react'

interface PessoaForm {
  nome: string
  sobrenome: string
  tipo: string
  email: string
  responsavel: string
  telefone: string
  celular: string
  endereco: string
  bairro: string
  cidade: string
  cep: string
  comum_congregacao: string
  instrumento: string
  senha: string
}

const EMPTY: PessoaForm = {
  nome: '', sobrenome: '', tipo: 'aluno', email: '',
  responsavel: '', telefone: '', celular: '', endereco: '',
  bairro: '', cidade: '', cep: '', comum_congregacao: '',
  instrumento: '', senha: '',
}

export default function PessoaFormPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const isNovo  = id === 'novo'

  const [form, setForm]       = useState<PessoaForm>(EMPTY)
  const [loading, setLoading] = useState(!isNovo)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (isNovo) return
    apiFetch(`/api/pessoas/${id}`)
      .then((p) => {
        setForm({
          nome:              p.nome              ?? '',
          sobrenome:         p.sobrenome         ?? '',
          tipo:              p.tipo              ?? 'aluno',
          email:             p.email             ?? '',
          responsavel:       p.responsavel       ?? '',
          telefone:          p.telefone          ?? '',
          celular:           p.celular           ?? '',
          endereco:          p.endereco          ?? '',
          bairro:            p.bairro            ?? '',
          cidade:            p.cidade            ?? '',
          cep:               p.cep               ?? '',
          comum_congregacao: p.comum_congregacao ?? '',
          instrumento:       p.instrumento       ?? '',
          senha: '',
        })
        setLoading(false)
      })
      .catch(() => { setError('Não foi possível carregar os dados.'); setLoading(false) })
  }, [id, isNovo])

  function handleChange(field: keyof PessoaForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleDelete() {
    try {
      await apiFetch(`/api/pessoas/${id}`, { method: 'DELETE' })
      router.push('/pessoas')
    } catch (err: any) {
      setError(err.message ?? 'Erro ao excluir')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const payload: Record<string, string> = { ...form }
      // Não envia email na edição (imutável após cadastro)
      if (!isNovo) delete payload.email
      // Só envia senha se preenchida
      if (!payload.senha) delete payload.senha

      if (isNovo) {
        await apiFetch('/api/pessoas', { method: 'POST', body: JSON.stringify(payload) })
        setSuccess('Pessoa cadastrada com sucesso!')
        setTimeout(() => router.push('/pessoas'), 1200)
      } else {
        await apiFetch(`/api/pessoas/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
        setSuccess('Dados atualizados com sucesso!')
      }
    } catch (err: any) {
      setError(err.message ?? 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/pessoas')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {isNovo ? 'Novo cadastro' : 'Editar pessoa'}
          </h1>
          <p className="text-sm text-gray-500">
            {isNovo ? 'Preencha os dados para cadastrar uma nova pessoa' : 'Atualize os dados da pessoa'}
          </p>
        </div>

        {!isNovo && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" size="sm">
                <Trash2 className="w-4 h-4" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir pessoa</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir <strong>{form.nome} {form.sobrenome}</strong>?
                  Esta ação não pode ser desfeita e todos os dados vinculados serão perdidos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Sim, excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Dados principais */}
        <Card>
          <CardHeader><CardTitle className="text-base">Dados principais</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome *</Label>
              <Input id="nome" value={form.nome} onChange={(e) => handleChange('nome', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sobrenome">Sobrenome *</Label>
              <Input id="sobrenome" value={form.sobrenome} onChange={(e) => handleChange('sobrenome', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select value={form.tipo} onValueChange={(v) => handleChange('tipo', v)}>
                <SelectTrigger id="tipo"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aluno">Aluno</SelectItem>
                  <SelectItem value="instrutor">Instrutor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">
                E-mail {!isNovo && <span className="text-gray-400 text-xs">(não editável)</span>}
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                readOnly={!isNovo}
                className={!isNovo ? 'bg-gray-50 cursor-default' : ''}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="instrumento">Instrumento</Label>
              <Input id="instrumento" value={form.instrumento} onChange={(e) => handleChange('instrumento', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="responsavel">Responsável</Label>
              <Input id="responsavel" value={form.responsavel} onChange={(e) => handleChange('responsavel', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Contato */}
        <Card>
          <CardHeader><CardTitle className="text-base">Contato</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" value={form.telefone} onChange={(e) => handleChange('telefone', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="celular">Celular</Label>
              <Input id="celular" value={form.celular} onChange={(e) => handleChange('celular', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader><CardTitle className="text-base">Endereço</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2 space-y-1.5">
              <Label htmlFor="endereco">Endereço</Label>
              <Input id="endereco" value={form.endereco} onChange={(e) => handleChange('endereco', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bairro">Bairro</Label>
              <Input id="bairro" value={form.bairro} onChange={(e) => handleChange('bairro', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cidade">Cidade</Label>
              <Input id="cidade" value={form.cidade} onChange={(e) => handleChange('cidade', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cep">CEP</Label>
              <Input id="cep" value={form.cep} onChange={(e) => handleChange('cep', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="comum_congregacao">Congregação</Label>
              <Input id="comum_congregacao" value={form.comum_congregacao} onChange={(e) => handleChange('comum_congregacao', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Senha — exibida apenas para instrutores */}
        {form.tipo === 'instrutor' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Senha</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5 max-w-sm">
              <Label htmlFor="senha">
                {isNovo ? 'Senha *' : 'Nova senha'}
                {!isNovo && <span className="text-gray-400 text-xs ml-1">(deixe em branco para não alterar)</span>}
              </Label>
              <Input
                id="senha"
                type="password"
                placeholder={isNovo ? 'Digite a senha' : 'Nova senha (opcional)'}
                value={form.senha}
                onChange={(e) => handleChange('senha', e.target.value)}
                required={isNovo}
              />
            </div>
          </CardContent>
        </Card>
        )}

        {/* Feedback */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">{success}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isNovo ? 'Cadastrar' : 'Salvar alterações'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/pessoas')}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
