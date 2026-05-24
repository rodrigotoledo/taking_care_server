'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Drop user profile tables in correct order
    await queryInterface.dropTable('user_profile_responsibles', { force: true });
    await queryInterface.dropTable('user_profile_professionals', { force: true });
    await queryInterface.dropTable('user_profile_patients', { force: true });
    await queryInterface.dropTable('user_profiles', { force: true });

    // Add admin and profile columns to users table
    await queryInterface.addColumn('users', 'admin', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('users', 'profile', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'profile');
    await queryInterface.removeColumn('users', 'admin');

    // Recreate user_profiles table
    await queryInterface.createTable('user_profiles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      display_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      avatar_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      cpf: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      rg: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      cpf_document_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      rg_document_url: {
        type: Sequelize.STRING,
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
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  }
};
