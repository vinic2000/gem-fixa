'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('login_log', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      usuario_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'pessoas',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      login_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      logout_at: {
        type: Sequelize.DATE,
        allowNull: true, // null = sessão ainda ativa
      },
      // JWT ID único — usado para rastrear sessões ativas e invalidar tokens
      token_jti: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      ip_address: {
        type: Sequelize.STRING(45), // suporta IPv6
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

    await queryInterface.addIndex('login_log', ['usuario_id'])
    await queryInterface.addIndex('login_log', ['token_jti'])
    await queryInterface.addIndex('login_log', ['logout_at']) // filtra sessões ativas (logout_at IS NULL)
  },

  async down(queryInterface) {
    await queryInterface.dropTable('login_log')
  },
}
