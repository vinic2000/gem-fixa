import { AuthService } from '@/services/auth.service'
import { Pessoa } from '@/lib/db/models'
import { LoginLog } from '@/lib/db/models'
import * as bcrypt from 'bcryptjs'
import * as jwtLib from '@/lib/auth/jwt'

jest.mock('@/lib/db/models', () => ({
  Pessoa: { findOne: jest.fn() },
  LoginLog: { create: jest.fn(), findOne: jest.fn(), update: jest.fn() },
}))

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}))

jest.mock('@/lib/auth/jwt', () => ({
  generateAccessToken: jest.fn(() => 'mock-access-token'),
  generateRefreshToken: jest.fn(() => 'mock-refresh-token'),
  verifyRefreshToken: jest.fn(),
}))

describe('AuthService - login', () => {
  it('deve autenticar instrutor com credenciais válidas', async () => {
    const instrutor = {
      id: 'uuid-instrutor',
      nome: 'Carlos',
      tipo: 'instrutor',
      senha_hash: 'hash',
    }
    ;(Pessoa.findOne as jest.Mock).mockResolvedValue(instrutor)
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
    ;(LoginLog.create as jest.Mock).mockResolvedValue({ id: 'log-id' })

    const result = await AuthService.login('carlos@email.com', 'senha123')

    expect(result).toHaveProperty('accessToken', 'mock-access-token')
    expect(result).toHaveProperty('refreshToken', 'mock-refresh-token')
    expect(LoginLog.create).toHaveBeenCalled()
  })

  it('deve lançar erro se usuário não encontrado', async () => {
    ;(Pessoa.findOne as jest.Mock).mockResolvedValue(null)
    await expect(AuthService.login('nao@existe.com', 'senha')).rejects.toThrow(
      'Credenciais inválidas'
    )
  })

  it('deve lançar erro se senha incorreta', async () => {
    const instrutor = { id: 'uuid', tipo: 'instrutor', senha_hash: 'hash' }
    ;(Pessoa.findOne as jest.Mock).mockResolvedValue(instrutor)
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)
    await expect(AuthService.login('email@test.com', 'errada')).rejects.toThrow(
      'Credenciais inválidas'
    )
  })

  it('deve lançar erro se usuário não for instrutor', async () => {
    const aluno = { id: 'uuid', tipo: 'aluno', senha_hash: 'hash' }
    ;(Pessoa.findOne as jest.Mock).mockResolvedValue(aluno)
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
    await expect(AuthService.login('aluno@test.com', 'senha')).rejects.toThrow(
      'Acesso negado'
    )
  })
})

describe('AuthService - refresh', () => {
  it('deve gerar novo access token com refresh token válido', async () => {
    const decoded = { sub: 'uuid-instrutor', jti: 'jti-old' }
    const logEntry = { token_jti: 'jti-old', logout_at: null, usuario_id: 'uuid-instrutor' }
    ;(jwtLib.verifyRefreshToken as jest.Mock).mockReturnValue(decoded)
    ;(LoginLog.findOne as jest.Mock).mockResolvedValue(logEntry)
    ;(LoginLog.create as jest.Mock).mockResolvedValue({ id: 'new-log' })
    ;(LoginLog.update as jest.Mock).mockResolvedValue([1])

    const result = await AuthService.refresh('valid-refresh-token')

    expect(result).toHaveProperty('accessToken', 'mock-access-token')
    expect(result).toHaveProperty('refreshToken', 'mock-refresh-token')
  })

  it('deve lançar erro se sessão já encerrada', async () => {
    const decoded = { sub: 'uuid', jti: 'jti-old' }
    ;(jwtLib.verifyRefreshToken as jest.Mock).mockReturnValue(decoded)
    ;(LoginLog.findOne as jest.Mock).mockResolvedValue(null)
    await expect(AuthService.refresh('token-sessao-encerrada')).rejects.toThrow(
      'Sessão inválida ou expirada'
    )
  })
})
