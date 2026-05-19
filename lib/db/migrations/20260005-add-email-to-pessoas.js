'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('pessoas', 'email', {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true,
    })
    await queryInterface.addIndex('pessoas', ['email'])
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('pessoas', 'email')
  },
}
