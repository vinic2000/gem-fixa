import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware/auth'
import { ComumCongregacaoService } from '@/services/comumCongregacao.service'
import { getErrorMessage } from '@/lib/errors'

type Context = { params: Promise<{ id: string }> }

// GET /api/comum-congregacao/[id]
export const GET = withAuth(async (_req: NextRequest, _user, context: Context) => {
  try {
    const { id } = await context.params
    const congregacao = await ComumCongregacaoService.buscarPorId(id)
    return NextResponse.json(congregacao, { status: 200 })
  } catch (err: unknown) {
    const message = getErrorMessage(err, 'Erro interno do servidor')
    if (message === 'Comum congregação não encontrada') {
      return NextResponse.json({ error: message }, { status: 404 })
    }
    console.error('[GET /api/comum-congregacao/[id]]', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})

// PUT /api/comum-congregacao/[id]
export const PUT = withAuth(async (req: NextRequest, _user, context: Context) => {
  try {
    const { id } = await context.params
    const body = await req.json()
    const congregacao = await ComumCongregacaoService.atualizar(id, body)
    return NextResponse.json(congregacao, { status: 200 })
  } catch (err: unknown) {
    const message = getErrorMessage(err, 'Erro interno do servidor')
    if (message === 'Comum congregação não encontrada') {
      return NextResponse.json({ error: message }, { status: 404 })
    }
    const errMsg = err instanceof Error ? err.message : ''
    if (errMsg.toLowerCase().includes('unique')) {
      return NextResponse.json({ error: 'Já existe uma congregação com esse nome' }, { status: 409 })
    }
    console.error('[PUT /api/comum-congregacao/[id]]', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})

// DELETE /api/comum-congregacao/[id]
export const DELETE = withAuth(async (_req: NextRequest, _user, context: Context) => {
  try {
    const { id } = await context.params
    await ComumCongregacaoService.deletar(id)
    return NextResponse.json({ message: 'Congregação removida com sucesso' }, { status: 200 })
  } catch (err: unknown) {
    const message = getErrorMessage(err, 'Erro interno do servidor')
    if (message === 'Comum congregação não encontrada') {
      return NextResponse.json({ error: message }, { status: 404 })
    }
    if (message.startsWith('Não é possível excluir:')) {
      return NextResponse.json({ error: message }, { status: 409 })
    }
    console.error('[DELETE /api/comum-congregacao/[id]]', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})
