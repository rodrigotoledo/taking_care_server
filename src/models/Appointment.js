const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize')

const Appointment = sequelize.define('Appointment', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    field: 'user_id'
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  professional: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  specialty: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
  },
  status: {
    type: DataTypes.ENUM(
      'draft',
      'doing',
      'completed',
      'canceled'
    ),
    defaultValue: 'draft'
  },
  notes: {
    type: DataTypes.TEXT,
  },
  prescription: {
    type: DataTypes.TEXT,
  },
  examRequest: {
    type: DataTypes.TEXT,
    field: 'exam_request'
  },
  nextAppointment: {
    type: DataTypes.DATE,
    field: 'next_appointment'
  }
}, {
  tableName: 'appointments',
  indexes: [
    {
      fields: ['user_id', 'date']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Appointment;
