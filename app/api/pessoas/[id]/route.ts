import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware/auth'
import { PessoaService } from '@/services/pessoa.service'
import { getErrorMessage } from '@/lib/errors'

type Context = { params: Promise<{ id: string }> }

// GET /api/pessoas/[id]
export const GET = withAuth(async (_req: NextRequest, user, context: Context) => {
  try {
    const { id } = await context.params
    const pessoa = await PessoaService.buscarPorId(id, user.sub)
    return NextResponse.json(pessoa, { status: 200 })
  } catch (err: unknown) {
    const message = getErrorMessage(err, 'Erro interno do servidor')
    if (message === 'Pessoa não encontrada') {
      return NextResponse.json({ error: message }, { status: 404 })
    }
    console.error('[GET /api/pessoas/[id]]', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})

// PUT /api/pessoas/[id]
export const PUT = withAuth(async (req: NextRequest, user, context: Context) => {
  try {
    const { id } = await context.params
    const body = await req.json()
    const pessoa = await PessoaService.atualizar(id, body, user.sub)
    return NextResponse.json(pessoa, { status: 200 })
  } catch (err: unknown) {
    const message = getErrorMessage(err, 'Erro interno do servidor')
    if (message === 'Pessoa não encontrada') {
      return NextResponse.json({ error: message }, { status: 404 })
    }
    console.error('[PUT /api/pessoas/[id]]', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})

// DELETE /api/pessoas/[id]
export const DELETE = withAuth(async (_req: NextRequest, user, context: Context) => {
  try {
    const { id } = await context.params
    await PessoaService.deletar(id, user.sub)
    return NextResponse.json({ message: 'Pessoa removida com sucesso' }, { status: 200 })
  } catch (err: unknown) {
    const message = getErrorMessage(err, 'Erro interno do servidor')
    if (message === 'Pessoa não encontrada') {
      return NextResponse.json({ error: message }, { status: 404 })
    }
    console.error('[DELETE /api/pessoas/[id]]', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})
