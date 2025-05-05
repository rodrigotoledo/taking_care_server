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
      'agendado',
      'confirmado',
      'cancelado',
      'realizado',
      'faltou'
    ),
    defaultValue: 'agendado'
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
      fields: ['date', 'doctor_id'] // Impede sobreposição de horários
    }
  ]
});

module.exports = Appointment;
