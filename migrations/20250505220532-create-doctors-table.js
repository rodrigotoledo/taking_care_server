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

      // personal data
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

      // Contact
      email: {
        type: Sequelize.STRING,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
      },
      password_confirmation: {
        type: Sequelize.STRING,
      },
      phone: {
        type: Sequelize.STRING(20)
      },
      emergency_phone: {
        type: Sequelize.STRING(20)
      },

      // Professional data
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

      // Availability
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      availability: {
        type: Sequelize.JSONB,
      },

      // Access data
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

    // Single compound index for CRM+UF
    await queryInterface.addIndex('doctors', ['crm', 'crm_uf'], {
      name: 'doctors_crm_uf_unique',
      unique: true
    });

    // Index for search for specialty
    await queryInterface.addIndex('doctors', ['specialty']);

    // Index for sub-specialties
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
