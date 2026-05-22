import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../index'

export type TipoAula = 'teorica' | 'pratica'

export interface FixaAttributes {
  id: string
  aluno_id: string
  data_aula: string // DATEONLY — formato 'YYYY-MM-DD'
  numero_pagina?: number | null
  numero_licao?: number | null
  tipo_aula: TipoAula
  created_at?: Date
  updated_at?: Date
}

export type FixaCreationAttributes = Optional<
  FixaAttributes,
  'id' | 'created_at' | 'updated_at'
>

class Fixa
  extends Model<FixaAttributes, FixaCreationAttributes>
  implements FixaAttributes
{
  declare id: string
  declare aluno_id: string
  declare data_aula: string
  declare numero_pagina: number | null
  declare numero_licao: number | null
  declare tipo_aula: TipoAula
  declare readonly created_at: Date
  declare readonly updated_at: Date
}

Fixa.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    aluno_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'pessoas', key: 'id' },
    },
    data_aula: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: { isDate: true },
    },
    numero_pagina: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 1 },
    },
    numero_licao: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 1 },
    },
    tipo_aula: {
      type: DataTypes.ENUM('teorica', 'pratica'),
      allowNull: false,
      validate: { isIn: [['teorica', 'pratica']] },
    },
  },
  {
    sequelize,
    tableName: 'fixa',
    modelName: 'Fixa',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
)

export default Fixa
