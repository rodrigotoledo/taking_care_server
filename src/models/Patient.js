const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize')

const Patient = sequelize.define('Patient', {
  // Dados básicos
  name: { type: DataTypes.STRING, allowNull: false },
  cpf: { type: DataTypes.STRING, unique: true },
  birthDate: { type: DataTypes.DATEONLY },
  gender: { type: DataTypes.ENUM('M', 'F', 'Other', 'Prefer not to say') },

  // Contato
  address: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, validate: { isEmail: true } },
  phone: { type: DataTypes.STRING(20) },

  fcmTokens: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },

  // Médicos
  bloodType: { type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') },
  allergies: { type: DataTypes.TEXT },

  // Status
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'patients',
  timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  paranoid: true, // Adiciona deletedAt para soft delete
});

Patient.prototype.getActiveAppointments = async function(options = {}) {
  const { Appointment } = require('./index'); // Ajuste o caminho conforme sua estrutura

  return await this.getAppointments({
    where: {
      status: {
        [Op.in]: ['agendado', 'confirmado']
      },
      date: {
        [Op.gte]: new Date()
      }
    },
    include: [{
      association: 'doctor',
      attributes: ['id', 'name', 'specialty'],
      required: false
    }],
    order: [['date', 'ASC']], // Ordena por data mais próxima
    ...options // Permite sobrescrever configurações
  });
};


module.exports = Patient;
