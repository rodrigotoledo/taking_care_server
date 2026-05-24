'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('appointments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        field: 'user_id'
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      professional: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      specialty: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      time: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      duration: {
        type: Sequelize.INTEGER,
        defaultValue: 30,
      },
      status: {
        type: Sequelize.ENUM('draft', 'doing', 'completed', 'canceled'),
        defaultValue: 'draft'
      },
      notes: {
        type: Sequelize.TEXT,
      },
      prescription: {
        type: Sequelize.TEXT,
      },
      examRequest: {
        type: Sequelize.TEXT,
        field: 'exam_request'
      },
      nextAppointment: {
        type: Sequelize.DATE,
        field: 'next_appointment'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
        field: 'created_at'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
        field: 'updated_at'
      }
    });

    await queryInterface.addIndex('appointments', {
      fields: ['user_id', 'date']
    });

    await queryInterface.addIndex('appointments', {
      fields: ['status']
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('appointments');
  }
};
