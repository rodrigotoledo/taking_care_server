const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize')

const Patient = sequelize.define('Patient', {
  name: { type: DataTypes.STRING, allowNull: false },
  cpf: { type: DataTypes.STRING, unique: true },
  birthDate: { type: DataTypes.DATEONLY },
  gender: { type: DataTypes.ENUM('M', 'F', 'Other', 'Prefer not to say') },

  address: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, validate: { isEmail: true } },
  phone: { type: DataTypes.STRING(20) },

  fcmTokens: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },

  bloodType: { type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') },
  allergies: { type: DataTypes.TEXT },

  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'patients',
  timestamps: true,
  paranoid: true,
});

Patient.prototype.getActiveAppointments = async function(options = {}) {
  return await this.getAppointments({
    where: {
      status: {
        [Op.in]: ['scheduled', 'confirmed']
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
    order: [['date', 'ASC']],
    ...options
  });
};


module.exports = Patient;
