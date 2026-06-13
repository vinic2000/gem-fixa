import Pessoa from './Pessoa'
import Fixa from './Fixa'
import AuditLog from './AuditLog'
import LoginLog from './LoginLog'
import ComumCongregacao from './ComumCongregacao'

// Re-exporta tipos para facilitar imports
export type { PessoaAttributes, PessoaCreationAttributes, TipoPessoa } from './Pessoa'
export type { FixaAttributes, FixaCreationAttributes, TipoAula } from './Fixa'
export type { AuditLogAttributes, AuditLogCreationAttributes, TipoAcao, DadosEdicao } from './AuditLog'
export type { LoginLogAttributes, LoginLogCreationAttributes } from './LoginLog'
export type {
  ComumCongregacaoAttributes,
  ComumCongregacaoCreationAttributes,
} from './ComumCongregacao'

// Associações
// Uma Pessoa (aluno) tem muitas Fixa
Pessoa.hasMany(Fixa, { foreignKey: 'aluno_id', as: 'aulas' })
Fixa.belongsTo(Pessoa, { foreignKey: 'aluno_id', as: 'aluno' })

// Uma Pessoa (instrutor) tem muitos AuditLog
Pessoa.hasMany(AuditLog, { foreignKey: 'usuario_id', as: 'auditLogs' })
AuditLog.belongsTo(Pessoa, { foreignKey: 'usuario_id', as: 'usuario' })

// Uma Pessoa (instrutor) tem muitos LoginLog
Pessoa.hasMany(LoginLog, { foreignKey: 'usuario_id', as: 'loginLogs' })
LoginLog.belongsTo(Pessoa, { foreignKey: 'usuario_id', as: 'usuario' })

// Uma ComumCongregacao tem muitas Pessoas
ComumCongregacao.hasMany(Pessoa, { foreignKey: 'comum_congregacao_id', as: 'pessoas' })
Pessoa.belongsTo(ComumCongregacao, { foreignKey: 'comum_congregacao_id', as: 'comum_congregacao' })


export { Pessoa, Fixa, AuditLog, LoginLog, ComumCongregacao }
