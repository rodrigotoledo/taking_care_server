// migrations/YYYYMMDDHHMMSS-add-patient-pathology-relation.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Cria a tabela de junção se não existir
    await queryInterface.createTable('patient_pathologies', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      patient_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'patients',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      pathology_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'pathologies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      diagnosis_date: {
        type: Sequelize.DATEONLY
      },
      notes: {
        type: Sequelize.TEXT
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

    // Adiciona índice único composto
    await queryInterface.addIndex('patient_pathologies',
      ['patient_id', 'pathology_id'], {
        name: 'patient_pathology_unique',
        unique: true
      });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('patient_pathologies');
  }
};
