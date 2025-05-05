const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize')

const Appointment = sequelize.define('Appointment', {
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Data e hora do atendimento'
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    comment: 'Duração em minutos'
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
    comment: 'Observações do médico'
  },
  prescription: {
    type: DataTypes.TEXT,
    comment: 'Medicamentos prescritos'
  },
  examRequest: {
    type: DataTypes.TEXT,
    comment: 'Exames solicitados'
  },
  nextAppointment: {
    type: DataTypes.DATE,
    comment: 'Data do retorno'
  }
}, {
  tableName: 'appointments',
  indexes: [
    {
      unique: true,
      fields: ['date', 'DoctorId'] // Impede sobreposição de horários
    }
  ]
});

module.exports = Appointment;
