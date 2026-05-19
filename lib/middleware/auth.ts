import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, DecodedAccessToken } from '@/lib/auth/jwt'

export interface AuthenticatedRequest extends NextRequest {
  user: DecodedAccessToken
}

/**
 * Verifica o JWT do header Authorization: Bearer <token>.
 * Retorna o payload decodificado ou NextResponse de erro.
 */
export function withAuth(
  handler: (req: NextRequest, user: DecodedAccessToken, context?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    const authHeader = req.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autenticação não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)

    try {
      const user = verifyAccessToken(token)
      return handler(req, user, context)
    } catch {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }
  }
}
