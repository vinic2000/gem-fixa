import { NextRequest, NextResponse } from 'next/server'

// Rotas que não precisam de autenticação
const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/refresh']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permite rotas públicas e arquivos estáticos
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // Para rotas de API (exceto auth), valida o header Authorization
  // A validação real do JWT ocorre no withAuth() de cada route handler
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
