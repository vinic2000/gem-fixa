'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pessoas', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      nome: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      sobrenome: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      tipo: {
        type: Sequelize.ENUM('aluno', 'instrutor'),
        allowNull: false,
      },
      responsavel: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      telefone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      celular: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      endereco: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      bairro: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      cidade: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      cep: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      comum_congregacao: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      instrumento: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      senha_hash: {
        type: Sequelize.STRING(255),
        allowNull: true, // apenas instrutores terão senha
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    })

    await queryInterface.addIndex('pessoas', ['tipo'])
    await queryInterface.addIndex('pessoas', ['nome', 'sobrenome'])
  },

  async down(queryInterface) {
    await queryInterface.dropTable('pessoas')
  },
}
