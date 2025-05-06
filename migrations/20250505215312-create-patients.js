// migrations/YYYYMMDDHHMMSS-create-patients-table.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('patients', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      cpf: {
        type: Sequelize.STRING(20),
        unique: true
      },
      birth_date: {
        type: Sequelize.DATEONLY
      },
      gender: {
        type: Sequelize.ENUM('M', 'F', 'Other', 'Prefer not to say')
      },
      address: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      password_confirmation: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(20)
      },
      fcm_tokens: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      },
      blood_type: {
        type: Sequelize.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
      },
      allergies: {
        type: Sequelize.TEXT
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Adiciona índice único para email
    await queryInterface.addIndex('patients', ['email'], {
      name: 'patients_email_index',
      unique: true,
      where: {
        deleted_at: null
      }
    });

    // Adiciona índice para buscas por nome
    await queryInterface.addIndex('patients', ['name']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('patients');
  }
};
