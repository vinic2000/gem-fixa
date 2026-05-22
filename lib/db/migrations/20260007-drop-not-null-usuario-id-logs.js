'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE "audit_log" ALTER COLUMN "usuario_id" DROP NOT NULL;'
    )
    await queryInterface.sequelize.query(
      'ALTER TABLE "login_log" ALTER COLUMN "usuario_id" DROP NOT NULL;'
    )
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE "login_log" ALTER COLUMN "usuario_id" SET NOT NULL;'
    )
    await queryInterface.sequelize.query(
      'ALTER TABLE "audit_log" ALTER COLUMN "usuario_id" SET NOT NULL;'
    )
  },
}
