'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('audit_log', 'usuario_id_legado', {
      type: Sequelize.UUID,
      allowNull: true,
    })

    await queryInterface.addColumn('login_log', 'usuario_id_legado', {
      type: Sequelize.UUID,
      allowNull: true,
    })

    await queryInterface.changeColumn('audit_log', 'usuario_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'pessoas',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    })

    await queryInterface.changeColumn('login_log', 'usuario_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'pessoas',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    })

    await queryInterface.addIndex('audit_log', ['usuario_id_legado'])
    await queryInterface.addIndex('login_log', ['usuario_id_legado'])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('login_log', ['usuario_id_legado'])
    await queryInterface.removeIndex('audit_log', ['usuario_id_legado'])

    await queryInterface.changeColumn('login_log', 'usuario_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'pessoas',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    })

    await queryInterface.changeColumn('audit_log', 'usuario_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'pessoas',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    })

    await queryInterface.removeColumn('login_log', 'usuario_id_legado')
    await queryInterface.removeColumn('audit_log', 'usuario_id_legado')
  },
}
