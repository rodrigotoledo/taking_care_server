'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pathologies', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      icd10: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      severity: {
        type: Sequelize.ENUM('lower', 'moderate', 'grave'),
        allowNull: true,
      },
      is_chronic: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      symptoms: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      treatment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('pathologies', ['name']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('pathologies');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_pathologies_severity";');
  },
};
