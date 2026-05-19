import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { Op } from 'sequelize'
import { Pessoa, LoginLog } from '@/lib/db/models'
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '@/lib/auth/jwt'

interface AuthResult {
  accessToken: string
  refreshToken: string
  instrutor: {
    id: string
    nome: string
    sobrenome: string
  }
}

export const AuthService = {
  /**
   * Realiza o login de um instrutor.
   * Gera access token (1h) e refresh token (4h).
   * Registra a sessão no login_log.
   */
  async login(email: string, senha: string, ipAddress?: string): Promise<AuthResult> {
    const pessoa = await Pessoa.findOne({ where: { email } })

    if (!pessoa || !pessoa.senha_hash) {
      throw new Error('Credenciais inválidas')
    }

    if (pessoa.tipo !== 'instrutor') {
      throw new Error('Acesso negado')
    }

    const senhaCorreta = await bcrypt.compare(senha, pessoa.senha_hash)
    if (!senhaCorreta) {
      throw new Error('Credenciais inválidas')
    }

    const jti = uuidv4()

    await LoginLog.create({
      usuario_id: pessoa.id,
      token_jti: jti,
      ip_address: ipAddress ?? null,
    })

    const accessToken = generateAccessToken({
      sub: pessoa.id,
      tipo: 'instrutor',
      jti,
    })

    const refreshToken = generateRefreshToken({ sub: pessoa.id, jti })

    return {
      accessToken,
      refreshToken,
      instrutor: {
        id: pessoa.id,
        nome: pessoa.nome,
        sobrenome: pessoa.sobrenome,
      },
    }
  },

  /**
   * Renova o access token usando um refresh token válido.
   * Invalida a sessão antiga e cria uma nova.
   */
  async refresh(refreshToken: string, ipAddress?: string): Promise<AuthResult> {
    const decoded = verifyRefreshToken(refreshToken)

    const sessao = await LoginLog.findOne({
      where: {
        token_jti: decoded.jti,
        logout_at: null,
      },
    })

    if (!sessao) {
      throw new Error('Sessão inválida ou expirada')
    }

    // Invalida a sessão anterior
    await LoginLog.update(
      { logout_at: new Date() },
      { where: { token_jti: decoded.jti } }
    )

    const novoJti = uuidv4()

    await LoginLog.create({
      usuario_id: decoded.sub,
      token_jti: novoJti,
      ip_address: ipAddress ?? null,
    })

    const accessToken = generateAccessToken({
      sub: decoded.sub,
      tipo: 'instrutor',
      jti: novoJti,
    })

    const novoRefreshToken = generateRefreshToken({ sub: decoded.sub, jti: novoJti })

    const pessoa = await Pessoa.findByPk(decoded.sub)

    return {
      accessToken,
      refreshToken: novoRefreshToken,
      instrutor: {
        id: decoded.sub,
        nome: pessoa?.nome ?? '',
        sobrenome: pessoa?.sobrenome ?? '',
      },
    }
  },

  /**
   * Encerra a sessão do instrutor (logout).
   */
  async logout(jti: string): Promise<void> {
    await LoginLog.update(
      { logout_at: new Date() },
      { where: { token_jti: jti, logout_at: null } }
    )
  },
}
