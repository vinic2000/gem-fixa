import { NextRequest, NextResponse } from 'next/server'
import { Op, WhereOptions } from 'sequelize'
import { withAuth } from '@/lib/middleware/auth'
import { PessoaService } from '@/services/pessoa.service'
import { ComumCongregacao, Pessoa, PessoaAttributes } from '@/lib/db/models'

// GET /api/pessoas?page=1&limit=10&tipo=aluno&search=nome
export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const { searchParams } = req.nextUrl
    const page    = Math.max(1, parseInt(searchParams.get('page')  ?? '1'))
    const limit   = Math.min(100, parseInt(searchParams.get('limit') ?? '10'))
    const tipo    = searchParams.get('tipo')   // 'aluno' | 'instrutor' | null
    const search  = searchParams.get('search') // busca por nome (autocomplete)
    const offset  = (page - 1) * limit

    const where: WhereOptions<PessoaAttributes> = {
      ...(tipo && ['aluno', 'instrutor'].includes(tipo) ? { tipo } : {}),
      ...(search
        ? {
            [Op.or]: [
              { nome: { [Op.iLike]: `%${search}%` } },
              { sobrenome: { [Op.iLike]: `%${search}%` } },
            ],
          }
        : {}),
    }

    const { count, rows } = await Pessoa.findAndCountAll({
      where,
      limit,
      offset,
      order: [['nome', 'ASC'], ['sobrenome', 'ASC']],
      attributes: { exclude: ['senha_hash'] },
      include: [{ model: ComumCongregacao, as: 'comum_congregacao', attributes: ['id', 'nome'] }],
    })

    // Auditoria apenas em listagem sem busca de autocomplete
    if (!search) {
      await PessoaService.listar(user.sub) // só para audit — refatorar se necessário
    }

    return NextResponse.json(
      { data: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) },
      { status: 200 }
    )
  } catch (err) {
    console.error('[GET /api/pessoas]', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})

// POST /api/pessoas - Cria uma nova pessoa
export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json()

    const camposObrigatorios = ['nome', 'sobrenome', 'tipo']
    for (const campo of camposObrigatorios) {
      if (!body[campo]) {
        return NextResponse.json(
          { error: `Campo obrigatório ausente: ${campo}` },
          { status: 400 }
        )
      }
    }

    if (!['aluno', 'instrutor'].includes(body.tipo)) {
      return NextResponse.json(
        { error: 'Tipo deve ser "aluno" ou "instrutor"' },
        { status: 400 }
      )
    }

    const pessoa = await PessoaService.criar(body, user.sub)
    return NextResponse.json(pessoa, { status: 201 })
  } catch (err: unknown) {
    console.error('[POST /api/pessoas]', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})
