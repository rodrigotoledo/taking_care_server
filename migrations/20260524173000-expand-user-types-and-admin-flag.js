'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('users');

    await queryInterface.sequelize.query(`ALTER TYPE "enum_users_user_type" ADD VALUE IF NOT EXISTS 'patient';`);
    await queryInterface.sequelize.query(`ALTER TYPE "enum_users_user_type" ADD VALUE IF NOT EXISTS 'responsible';`);

    if (!table.is_admin) {
      await queryInterface.addColumn('users', 'is_admin', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }

    await queryInterface.sequelize.query(`
      UPDATE "users"
      SET "is_admin" = true
      WHERE "user_type" = 'admin';
    `);
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('users');

    if (table.is_admin) {
      await queryInterface.removeColumn('users', 'is_admin');
    }
  },
};
