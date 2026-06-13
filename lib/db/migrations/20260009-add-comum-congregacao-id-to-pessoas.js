'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('pessoas', 'comum_congregacao_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'comum_congregacao',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('pessoas', 'comum_congregacao_id')
  },
}
