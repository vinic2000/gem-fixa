'use strict'

const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const senhaHash = await bcrypt.hash('admin123', 10)

    await queryInterface.bulkInsert('pessoas', [
      {
        id: uuidv4(),
        nome: 'Administrador',
        sobrenome: 'Sistema',
        tipo: 'instrutor',
        email: 'admin@hemfixa.com',
        senha_hash: senhaHash,
        responsavel: null,
        telefone: null,
        celular: null,
        endereco: null,
        bairro: null,
        cidade: null,
        cep: null,
        comum_congregacao: null,
        instrumento: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('pessoas', { email: 'admin@hemfixa.com' })
  },
}
