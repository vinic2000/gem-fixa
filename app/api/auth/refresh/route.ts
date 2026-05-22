import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/services/auth.service'
import { getErrorMessage } from '@/lib/errors'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { refreshToken } = body

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token é obrigatório' },
        { status: 400 }
      )
    }

    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? undefined

    const result = await AuthService.refresh(refreshToken, ipAddress)

    return NextResponse.json(result, { status: 200 })
  } catch (err: unknown) {
    const message = getErrorMessage(err, 'Erro interno do servidor')
    if (message === 'Sessão inválida ou expirada') {
      return NextResponse.json({ error: message }, { status: 401 })
    }
    if (
      err instanceof Error &&
      (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError')
    ) {
      return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 401 })
    }
    console.error('[POST /api/auth/refresh]', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
