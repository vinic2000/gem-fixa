import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken'

const ACCESS_SECRET = process.env.JWT_SECRET || 'dev_secret_access_32chars_minimum!!'
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_secret_refresh_32chars_minimum!!'

export interface AccessTokenPayload {
  sub: string      // ID do instrutor
  tipo: 'instrutor'
  jti: string      // JWT ID — vincula ao login_log
}

export interface RefreshTokenPayload {
  sub: string
  jti: string
}

export type DecodedAccessToken = AccessTokenPayload & Omit<JwtPayload, 'sub' | 'jti'>
export type DecodedRefreshToken = RefreshTokenPayload & Omit<JwtPayload, 'sub' | 'jti'>

/**
 * Gera um access token com expiração de 1 hora.
 */
export function generateAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = { expiresIn: '1h' }
  return jwt.sign(payload, ACCESS_SECRET, options)
}

/**
 * Gera um refresh token com expiração de 4 horas.
 */
export function generateRefreshToken(payload: RefreshTokenPayload): string {
  const options: SignOptions = { expiresIn: '4h' }
  return jwt.sign(payload, REFRESH_SECRET, options)
}

/**
 * Verifica e decodifica um access token.
 * Lança erro se inválido ou expirado.
 */
export function verifyAccessToken(token: string): DecodedAccessToken {
  return jwt.verify(token, ACCESS_SECRET) as DecodedAccessToken
}

/**
 * Verifica e decodifica um refresh token.
 * Lança erro se inválido ou expirado.
 */
export function verifyRefreshToken(token: string): DecodedRefreshToken {
  return jwt.verify(token, REFRESH_SECRET) as DecodedRefreshToken
}
