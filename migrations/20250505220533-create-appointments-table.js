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
        comment: 'Data e hora do atendimento'
      },
      duration: {
        type: Sequelize.INTEGER,
        defaultValue: 30,
        comment: 'Duração em minutos'
      },
      status: {
        type: Sequelize.ENUM(
          'agendado',
          'confirmado',
          'cancelado',
          'realizado',
          'faltou'
        ),
        defaultValue: 'agendado'
      },
      notes: {
        type: Sequelize.TEXT,
        comment: 'Observações do médico'
      },
      prescription: {
        type: Sequelize.TEXT,
        comment: 'Medicamentos prescritos'
      },
      exam_request: {
        type: Sequelize.TEXT,
        comment: 'Exames solicitados'
      },
      next_appointment: {
        type: Sequelize.DATE,
        comment: 'Data do retorno'
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

    // Índice para evitar agendamentos duplicados no mesmo horário
    await queryInterface.addIndex('appointments', ['date', 'doctor_id'], {
      name: 'appointments_date_doctor_unique',
      unique: true
    });

    // Índice para buscas por status
    await queryInterface.addIndex('appointments', ['status']);

    // Índice para buscas por paciente
    await queryInterface.addIndex('appointments', ['patient_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('appointments');
  }
};
