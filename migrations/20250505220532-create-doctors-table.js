// migrations/YYYYMMDDHHMMSS-create-doctors-table.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('doctors', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      // Dados pessoais
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      crm: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      crm_uf: {
        type: Sequelize.STRING(2),
        allowNull: false,
      },
      fcm_tokens: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      },

      // Contato
      email: {
        type: Sequelize.STRING,
        unique: true
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
      emergency_phone: {
        type: Sequelize.STRING(20)
      },

      // Dados profissionais
      specialty: {
        type: Sequelize.STRING,
        allowNull: false
      },
      sub_specialties: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      },
      residency: {
        type: Sequelize.STRING
      },
      medical_school: {
        type: Sequelize.STRING
      },
      graduation_year: {
        type: Sequelize.INTEGER
      },

      // Disponibilidade
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      availability: {
        type: Sequelize.JSONB,
      },

      // Dados de acesso
      photo_url: {
        type: Sequelize.STRING
      },
      bio: {
        type: Sequelize.TEXT
      },

      // Timestamps
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

    // Índice composto único para CRM+UF
    await queryInterface.addIndex('doctors', ['crm', 'crm_uf'], {
      name: 'doctors_crm_uf_unique',
      unique: true
    });

    // Índice para busca por especialidade
    await queryInterface.addIndex('doctors', ['specialty']);

    // Índice para busca por sub-especialidades
    await queryInterface.addConstraint('doctors', {
      type: 'CHECK',
      name: 'sub_specialties_array_check',
      fields: ['sub_specialties'],
      where: {
        sub_specialties: {
          [Sequelize.Op.not]: null
        }
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('doctors');
  }
};
