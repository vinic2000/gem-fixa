import { withAuth } from '@/lib/middleware/auth'
import { verifyAccessToken } from '@/lib/auth/jwt'

jest.mock('@/lib/auth/jwt', () => ({
  verifyAccessToken: jest.fn(),
}))

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      body,
    }),
  },
}))

describe('withAuth', () => {
  it('deve retornar 401 quando header authorization ausente', async () => {
    const handler = jest.fn()
    const wrapped = withAuth(handler as any)

    const req = { headers: { get: () => null } } as any
    const res = await wrapped(req, {})

    expect(res.status).toBe(401)
    expect(handler).not.toHaveBeenCalled()
  })

  it('deve chamar handler quando token for válido', async () => {
    ;(verifyAccessToken as jest.Mock).mockReturnValue({ sub: 'u1', tipo: 'instrutor', jti: 'j1' })

    const handler = jest.fn().mockResolvedValue({ status: 200, body: { ok: true } })
    const wrapped = withAuth(handler as any)

    const req = { headers: { get: () => 'Bearer token-ok' } } as any
    const res = await wrapped(req, { params: { id: '1' } })

    expect(verifyAccessToken).toHaveBeenCalledWith('token-ok')
    expect(handler).toHaveBeenCalled()
    expect(res.status).toBe(200)
  })

  it('deve retornar 401 quando token for inválido', async () => {
    ;(verifyAccessToken as jest.Mock).mockImplementation(() => {
      throw new Error('invalid token')
    })

    const handler = jest.fn()
    const wrapped = withAuth(handler as any)

    const req = { headers: { get: () => 'Bearer token-invalido' } } as any
    const res = await wrapped(req, {})

    expect(res.status).toBe(401)
    expect(handler).not.toHaveBeenCalled()
  })
})
