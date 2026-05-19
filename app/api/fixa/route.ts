import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware/auth'
import { FixaService } from '@/services/fixa.service'

// GET /api/fixa?aluno_id=uuid&page=1&limit=10&tipo_aula=pratica
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = req.nextUrl
    const alunoId   = searchParams.get('aluno_id')
    const page      = Math.max(1, parseInt(searchParams.get('page')  ?? '1'))
    const limit     = Math.min(100, parseInt(searchParams.get('limit') ?? '10'))
    const tipoAula  = searchParams.get('tipo_aula') // 'pratica' | 'teorica' | null

    if (!alunoId) {
      return NextResponse.json(
        { error: 'Parâmetro aluno_id é obrigatório' },
        { status: 400 }
      )
    }

    if (tipoAula && !['pratica', 'teorica'].includes(tipoAula)) {
      return NextResponse.json(
        { error: 'tipo_aula deve ser "pratica" ou "teorica"' },
        { status: 400 }
      )
    }

    const { count, rows } = await FixaService.listarPorAlunoComPaginacao(
      alunoId,
      page,
      limit,
      tipoAula as 'pratica' | 'teorica' | null
    )

    return NextResponse.json(
      { data: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) },
      { status: 200 }
    )
  } catch (err) {
    console.error('[GET /api/fixa]', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})

// POST /api/fixa - Cria nova aula
export const POST = withAuth(async (req: NextRequest) => {
  try {
    const body = await req.json()

    const camposObrigatorios = ['aluno_id', 'data_aula', 'tipo_aula']
    for (const campo of camposObrigatorios) {
      if (!body[campo]) {
        return NextResponse.json(
          { error: `Campo obrigatório ausente: ${campo}` },
          { status: 400 }
        )
      }
    }

    if (!['teorica', 'pratica'].includes(body.tipo_aula)) {
      return NextResponse.json(
        { error: 'tipo_aula deve ser "teorica" ou "pratica"' },
        { status: 400 }
      )
    }

    const fixa = await FixaService.criar(body)
    return NextResponse.json(fixa, { status: 201 })
  } catch (err: any) {
    if (err.message === 'Aluno não encontrado' || err.message === 'O ID informado não pertence a um aluno') {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    console.error('[POST /api/fixa]', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})
