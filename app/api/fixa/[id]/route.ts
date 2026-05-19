import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware/auth'
import { FixaService } from '@/services/fixa.service'

type Context = { params: Promise<{ id: string }> }

// GET /api/fixa/[id]
export const GET = withAuth(async (_req: NextRequest, _user, context: Context) => {
  try {
    const { id } = await context.params
    const fixa = await FixaService.buscarPorId(id)
    return NextResponse.json(fixa, { status: 200 })
  } catch (err: any) {
    if (err.message === 'Aula não encontrada') {
      return NextResponse.json({ error: err.message }, { status: 404 })
    }
    console.error('[GET /api/fixa/[id]]', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})

// PUT /api/fixa/[id]
export const PUT = withAuth(async (req: NextRequest, _user, context: Context) => {
  try {
    const { id } = await context.params
    const body = await req.json()
    const fixa = await FixaService.atualizar(id, body)
    return NextResponse.json(fixa, { status: 200 })
  } catch (err: any) {
    if (err.message === 'Aula não encontrada') {
      return NextResponse.json({ error: err.message }, { status: 404 })
    }
    console.error('[PUT /api/fixa/[id]]', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})

// DELETE /api/fixa/[id]
export const DELETE = withAuth(async (_req: NextRequest, _user, context: Context) => {
  try {
    const { id } = await context.params
    await FixaService.deletar(id)
    return NextResponse.json({ message: 'Aula removida com sucesso' }, { status: 200 })
  } catch (err: any) {
    if (err.message === 'Aula não encontrada') {
      return NextResponse.json({ error: err.message }, { status: 404 })
    }
    console.error('[DELETE /api/fixa/[id]]', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})
