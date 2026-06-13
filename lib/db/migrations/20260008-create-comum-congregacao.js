'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('comum_congregacao', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      nome: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true,
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

    await queryInterface.addIndex('comum_congregacao', ['nome'])
  },

  async down(queryInterface) {
    await queryInterface.dropTable('comum_congregacao')
  },
}
