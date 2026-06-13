import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../index'

export interface ComumCongregacaoAttributes {
  id: string
  nome: string
  endereco?: string | null
  bairro?: string | null
  cidade?: string | null
  cep?: string | null
  created_at?: Date
  updated_at?: Date
}

export type ComumCongregacaoCreationAttributes = Optional<
  ComumCongregacaoAttributes,
  'id' | 'created_at' | 'updated_at'
>

class ComumCongregacao
  extends Model<ComumCongregacaoAttributes, ComumCongregacaoCreationAttributes>
  implements ComumCongregacaoAttributes
{
  declare id: string
  declare nome: string
  declare endereco: string | null
  declare bairro: string | null
  declare cidade: string | null
  declare cep: string | null
  declare readonly created_at: Date
  declare readonly updated_at: Date
}

ComumCongregacao.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    nome: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: { notEmpty: true, len: [1, 150] },
    },
    endereco: { type: DataTypes.STRING(255), allowNull: true },
    bairro: { type: DataTypes.STRING(100), allowNull: true },
    cidade: { type: DataTypes.STRING(100), allowNull: true },
    cep: { type: DataTypes.STRING(10), allowNull: true },
  },
  {
    sequelize,
    tableName: 'comum_congregacao',
    modelName: 'ComumCongregacao',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
)

export default ComumCongregacao
