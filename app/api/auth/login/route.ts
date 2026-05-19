import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/services/auth.service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, senha } = body

    if (!email || !senha) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      req.headers.get('x-real-ip') ??
      undefined

    const result = await AuthService.login(email, senha, ipAddress)

    return NextResponse.json(result, { status: 200 })
  } catch (err: any) {
    if (err.message === 'Credenciais inválidas' || err.message === 'Acesso negado') {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    console.error('[POST /api/auth/login]', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
