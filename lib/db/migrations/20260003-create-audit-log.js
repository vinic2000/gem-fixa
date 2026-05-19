'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('audit_log', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      data_acao: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      acao: {
        type: Sequelize.ENUM('consulta', 'cadastro', 'edicao', 'exclusao'),
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
      entidade: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'pessoa',
      },
      entidade_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      // Em caso de edição: { campo: { antes: 'valor_antigo', depois: 'valor_novo' } }
      dados: {
        type: Sequelize.JSONB,
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

    await queryInterface.addIndex('audit_log', ['usuario_id'])
    await queryInterface.addIndex('audit_log', ['acao'])
    await queryInterface.addIndex('audit_log', ['entidade_id'])
    await queryInterface.addIndex('audit_log', ['data_acao'])
  },

  async down(queryInterface) {
    await queryInterface.dropTable('audit_log')
  },
}
