import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  AccessTokenPayload,
} from '@/lib/auth/jwt'

describe('JWT - generateAccessToken', () => {
  it('deve gerar um access token válido', () => {
    const payload: AccessTokenPayload = {
      sub: 'uuid-instrutor-1',
      tipo: 'instrutor',
      jti: 'jti-123',
    }
    const token = generateAccessToken(payload)
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3)
  })

  it('deve gerar tokens diferentes para payloads iguais (jti único)', () => {
    const payload1: AccessTokenPayload = { sub: 'uuid-1', tipo: 'instrutor', jti: 'jti-1' }
    const payload2: AccessTokenPayload = { sub: 'uuid-1', tipo: 'instrutor', jti: 'jti-2' }
    const token1 = generateAccessToken(payload1)
    const token2 = generateAccessToken(payload2)
    expect(token1).not.toBe(token2)
  })
})

describe('JWT - verifyAccessToken', () => {
  it('deve verificar e retornar o payload de um access token válido', () => {
    const payload: AccessTokenPayload = {
      sub: 'uuid-instrutor-1',
      tipo: 'instrutor',
      jti: 'jti-abc',
    }
    const token = generateAccessToken(payload)
    const decoded = verifyAccessToken(token)

    expect(decoded.sub).toBe(payload.sub)
    expect(decoded.tipo).toBe(payload.tipo)
    expect(decoded.jti).toBe(payload.jti)
  })

  it('deve lançar erro para token inválido', () => {
    expect(() => verifyAccessToken('token.invalido.aqui')).toThrow()
  })

  it('deve lançar erro para token com assinatura adulterada', () => {
    const payload: AccessTokenPayload = { sub: 'uuid-1', tipo: 'instrutor', jti: 'jti-1' }
    const token = generateAccessToken(payload)
    const tampered = token.slice(0, -5) + 'XXXXX'
    expect(() => verifyAccessToken(tampered)).toThrow()
  })
})

describe('JWT - generateRefreshToken / verifyRefreshToken', () => {
  it('deve gerar e verificar um refresh token válido', () => {
    const jti = 'refresh-jti-xyz'
    const sub = 'uuid-instrutor-2'
    const token = generateRefreshToken({ sub, jti })
    const decoded = verifyRefreshToken(token)

    expect(decoded.sub).toBe(sub)
    expect(decoded.jti).toBe(jti)
  })

  it('deve lançar erro para refresh token inválido', () => {
    expect(() => verifyRefreshToken('refresh.invalido.aqui')).toThrow()
  })
})
