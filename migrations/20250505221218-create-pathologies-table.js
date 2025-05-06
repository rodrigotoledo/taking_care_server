// migrations/YYYYMMDDHHMMSS-create-pathologies-table.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pathologies', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      icd10: {
        type: Sequelize.STRING(10)
      },
      severity: {
        type: Sequelize.ENUM('lower', 'moderate', 'grave'),
        defaultValue: 'moderate'
      },
      is_chronic: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      symptoms: {
        type: Sequelize.TEXT,
      },
      treatment: {
        type: Sequelize.TEXT,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Single index for CID-10 code
    await queryInterface.addIndex('pathologies', ['icd10'], {
      name: 'pathologies_icd10_unique',
      unique: true,
      where: {
        icd10: {
          [Sequelize.Op.not]: null
        }
      }
    });

    // Index for search for gravity
    await queryInterface.addIndex('pathologies', ['severity']);

    // Index for chronic pathologies
    await queryInterface.addIndex('pathologies', ['is_chronic']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('pathologies');
  }
};
