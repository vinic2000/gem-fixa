import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware/auth'
import { AuthService } from '@/services/auth.service'

export const POST = withAuth(async (_req, user) => {
  try {
    await AuthService.logout(user.jti!)
    return NextResponse.json({ message: 'Logout realizado com sucesso' }, { status: 200 })
  } catch (err) {
    console.error('[POST /api/auth/logout]', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})
