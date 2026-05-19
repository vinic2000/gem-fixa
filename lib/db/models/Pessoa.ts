import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../index'

export type TipoPessoa = 'aluno' | 'instrutor'

export interface PessoaAttributes {
  id: string
  nome: string
  sobrenome: string
  tipo: TipoPessoa
  responsavel?: string | null
  telefone?: string | null
  celular?: string | null
  endereco?: string | null
  bairro?: string | null
  cidade?: string | null
  cep?: string | null
  comum_congregacao?: string | null
  instrumento?: string | null
  email?: string | null
  senha_hash?: string | null
  created_at?: Date
  updated_at?: Date
}

export interface PessoaCreationAttributes
  extends Optional<PessoaAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Pessoa
  extends Model<PessoaAttributes, PessoaCreationAttributes>
  implements PessoaAttributes
{
  declare id: string
  declare nome: string
  declare sobrenome: string
  declare tipo: TipoPessoa
  declare responsavel: string | null
  declare telefone: string | null
  declare celular: string | null
  declare endereco: string | null
  declare bairro: string | null
  declare cidade: string | null
  declare cep: string | null
  declare comum_congregacao: string | null
  declare instrumento: string | null
  declare email: string | null
  declare senha_hash: string | null
  declare readonly created_at: Date
  declare readonly updated_at: Date
}

Pessoa.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { notEmpty: true, len: [1, 100] },
    },
    sobrenome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { notEmpty: true, len: [1, 100] },
    },
    tipo: {
      type: DataTypes.ENUM('aluno', 'instrutor'),
      allowNull: false,
      validate: { isIn: [['aluno', 'instrutor']] },
    },
    responsavel: { type: DataTypes.STRING(200), allowNull: true },
    telefone: { type: DataTypes.STRING(20), allowNull: true },
    celular: { type: DataTypes.STRING(20), allowNull: true },
    endereco: { type: DataTypes.STRING(255), allowNull: true },
    bairro: { type: DataTypes.STRING(100), allowNull: true },
    cidade: { type: DataTypes.STRING(100), allowNull: true },
    cep: { type: DataTypes.STRING(10), allowNull: true },
    comum_congregacao: { type: DataTypes.STRING(150), allowNull: true },
    instrumento: { type: DataTypes.STRING(100), allowNull: true },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      validate: { isEmail: true },
    },
    senha_hash: { type: DataTypes.STRING(255), allowNull: true },
  },
  {
    sequelize,
    tableName: 'pessoas',
    modelName: 'Pessoa',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
)

export default Pessoa
