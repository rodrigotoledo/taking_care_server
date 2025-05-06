const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize')

const Appointment = sequelize.define('Appointment', {
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
  },
  status: {
    type: DataTypes.ENUM(
      'scheduled',
      'confirmed',
      'canceled',
      'finished',
      'missing'
    ),
    defaultValue: 'scheduled'
  },
  notes: {
    type: DataTypes.TEXT,
  },
  prescription: {
    type: DataTypes.TEXT,
  },
  examRequest: {
    type: DataTypes.TEXT,
  },
  nextAppointment: {
    type: DataTypes.DATE,
  }
}, {
  tableName: 'appointments',
  indexes: [
    {
      unique: true,
      fields: ['date', 'doctor_id'] // Prevents schedule overlapping
    }
  ]
});

module.exports = Appointment;
