import { NextRequest, NextResponse } from 'next/server'
import { Op } from 'sequelize'
import { withAuth } from '@/lib/middleware/auth'
import { ComumCongregacaoService } from '@/services/comumCongregacao.service'
import { ComumCongregacao } from '@/lib/db/models'

// GET /api/comum-congregacao?page=1&limit=10&search=nome
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = req.nextUrl
    const page   = Math.max(1, parseInt(searchParams.get('page')  ?? '1'))
    const limit  = Math.min(100, parseInt(searchParams.get('limit') ?? '10'))
    const search = searchParams.get('search')
    const offset = (page - 1) * limit

    const where = search
      ? { nome: { [Op.iLike]: `%${search}%` } }
      : {}

    const { count, rows } = await ComumCongregacao.findAndCountAll({
      where,
      limit,
      offset,
      order: [['nome', 'ASC']],
    })

    return NextResponse.json(
      { data: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) },
      { status: 200 }
    )
  } catch (err) {
    console.error('[GET /api/comum-congregacao]', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})

// POST /api/comum-congregacao
export const POST = withAuth(async (req: NextRequest) => {
  try {
    const body = await req.json()

    if (!body.nome?.trim()) {
      return NextResponse.json({ error: 'Campo obrigatório ausente: nome' }, { status: 400 })
    }

    const congregacao = await ComumCongregacaoService.criar(body)
    return NextResponse.json(congregacao, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : ''
    if (message.toLowerCase().includes('unique') || message.toLowerCase().includes('unique constraint')) {
      return NextResponse.json({ error: 'Já existe uma congregação com esse nome' }, { status: 409 })
    }
    console.error('[POST /api/comum-congregacao]', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})
