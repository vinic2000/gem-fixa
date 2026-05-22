import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../index'

export type TipoAcao = 'consulta' | 'cadastro' | 'edicao' | 'exclusao'

// Formato dos dados de edição: { campo: { antes: valor, depois: valor } }
export interface DadosEdicao {
  [campo: string]: {
    antes: unknown
    depois: unknown
  }
}

export interface AuditLogAttributes {
  id: string
  data_acao: Date
  acao: TipoAcao
  usuario_id: string | null
  usuario_id_legado?: string | null
  entidade: string
  entidade_id?: string | null
  dados?: DadosEdicao | null
  created_at?: Date
  updated_at?: Date
}

export type AuditLogCreationAttributes = Optional<
  AuditLogAttributes,
  'id' | 'data_acao' | 'created_at' | 'updated_at'
>

class AuditLog
  extends Model<AuditLogAttributes, AuditLogCreationAttributes>
  implements AuditLogAttributes
{
  declare id: string
  declare data_acao: Date
  declare acao: TipoAcao
  declare usuario_id: string | null
  declare usuario_id_legado: string | null
  declare entidade: string
  declare entidade_id: string | null
  declare dados: DadosEdicao | null
  declare readonly created_at: Date
  declare readonly updated_at: Date
}

AuditLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    data_acao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    acao: {
      type: DataTypes.ENUM('consulta', 'cadastro', 'edicao', 'exclusao'),
      allowNull: false,
    },
    usuario_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'pessoas', key: 'id' },
    },
    usuario_id_legado: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    entidade: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'pessoa',
    },
    entidade_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    dados: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'audit_log',
    modelName: 'AuditLog',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
)

export default AuditLog
