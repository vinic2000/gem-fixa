import { AuditLog, LoginLog } from '@/lib/db/models'
import type { TipoAcao } from '@/lib/db/models'

interface RegistrarAuditOptions {
  acao: TipoAcao
  usuario_id: string
  entidade_id?: string
  dados?: Record<string, { antes: unknown; depois: unknown }>
}

/**
 * Registra uma entrada no audit_log da entidade pessoa.
 */
export async function registrarAudit(options: RegistrarAuditOptions): Promise<void> {
  await AuditLog.create({
    acao: options.acao,
    usuario_id: options.usuario_id,
    entidade: 'pessoa',
    entidade_id: options.entidade_id ?? null,
    dados: options.dados ?? null,
  })
}

/**
 * Calcula o diff entre dois objetos para o campo `dados` do audit log de edição.
 * Retorna apenas os campos que foram alterados.
 */
export function calcularDiff(
  antes: Record<string, unknown>,
  depois: Record<string, unknown>
): Record<string, { antes: unknown; depois: unknown }> {
  const diff: Record<string, { antes: unknown; depois: unknown }> = {}
  const camposIgnorados = ['id', 'senha_hash', 'created_at', 'updated_at']

  for (const campo of Object.keys(depois)) {
    if (camposIgnorados.includes(campo)) continue
    if (antes[campo] !== depois[campo]) {
      diff[campo] = { antes: antes[campo], depois: depois[campo] }
    }
  }

  return diff
}

/**
 * Retorna todas as sessões ativas (sem logout_at).
 */
export async function sessõesAtivas() {
  return LoginLog.findAll({
    where: { logout_at: null },
  })
}
