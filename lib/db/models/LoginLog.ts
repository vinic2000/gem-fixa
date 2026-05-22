import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../index'

export interface LoginLogAttributes {
  id: string
  usuario_id: string | null
  usuario_id_legado?: string | null
  login_at: Date
  logout_at?: Date | null
  token_jti: string
  ip_address?: string | null
  created_at?: Date
  updated_at?: Date
}

export type LoginLogCreationAttributes = Optional<
  LoginLogAttributes,
  'id' | 'login_at' | 'logout_at' | 'created_at' | 'updated_at'
>

class LoginLog
  extends Model<LoginLogAttributes, LoginLogCreationAttributes>
  implements LoginLogAttributes
{
  declare id: string
  declare usuario_id: string | null
  declare usuario_id_legado: string | null
  declare login_at: Date
  declare logout_at: Date | null
  declare token_jti: string
  declare ip_address: string | null
  declare readonly created_at: Date
  declare readonly updated_at: Date

  get isActive(): boolean {
    return this.logout_at === null
  }
}

LoginLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    login_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    logout_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    token_jti: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'login_log',
    modelName: 'LoginLog',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
)

export default LoginLog
