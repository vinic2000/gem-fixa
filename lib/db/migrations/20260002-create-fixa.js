'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('fixa', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      aluno_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'pessoas',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      data_aula: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      numero_pagina: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      numero_licao: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      tipo_aula: {
        type: Sequelize.ENUM('teorica', 'pratica'),
        allowNull: false,
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

    await queryInterface.addIndex('fixa', ['aluno_id'])
    await queryInterface.addIndex('fixa', ['data_aula'])
    await queryInterface.addIndex('fixa', ['tipo_aula'])
  },

  async down(queryInterface) {
    await queryInterface.dropTable('fixa')
  },
}
