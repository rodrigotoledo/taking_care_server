// migrations/YYYYMMDDHHMMSS-create-appointments-table.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('appointments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      duration: {
        type: Sequelize.INTEGER,
        defaultValue: 30,
      },
      status: {
        type: Sequelize.ENUM(
          'scheduled',
          'confirmed',
          'canceled',
          'finished',
          'missing'
        ),
        defaultValue: 'scheduled'
      },
      notes: {
        type: Sequelize.TEXT,
      },
      prescription: {
        type: Sequelize.TEXT,
      },
      exam_request: {
        type: Sequelize.TEXT,
      },
      next_appointment: {
        type: Sequelize.DATE,
      },
      doctor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'doctors',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'patients',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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

    // Index to avoid duplicate appointments at the same time
    await queryInterface.addIndex('appointments', ['date', 'doctor_id'], {
      name: 'appointments_date_doctor_unique',
      unique: true
    });

    // Find index for status
    await queryInterface.addIndex('appointments', ['status']);

    // Index for search for patients
    await queryInterface.addIndex('appointments', ['patient_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('appointments');
  }
};
