const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize')

const Doctor = sequelize.define('Doctor', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  crm: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  crm_uf: {
    type: DataTypes.STRING(2),
    allowNull: false
  },
  fcmTokens: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },

  email: {
    type: DataTypes.STRING,
    validate: { isEmail: true },
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    validate: { notEmpty: true },
  },
  passwordConfirmation: {
    type: DataTypes.STRING,
    validate: { notEmpty: true },
  },
  phone: { type: DataTypes.STRING(20) },
  emergencyPhone: { type: DataTypes.STRING(20) },

  specialty: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subSpecialties: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  residency: { type: DataTypes.STRING },
  medicalSchool: { type: DataTypes.STRING },
  graduationYear: { type: DataTypes.INTEGER },

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  availability: {
    type: DataTypes.JSONB,
  },

  photoUrl: { type: DataTypes.STRING },
  bio: { type: DataTypes.TEXT }
}, {
  tableName: 'doctors',
  timestamps: true,
  paranoid: true,
  indexes: [
    { unique: true, fields: ['crm', 'crm_uf'] },
    { fields: ['specialty'] }
  ],
  hooks: {
    beforeValidate: (doctor) => {
      if (doctor.crmUf) {
        doctor.crmUf = doctor.crmUf.toUpperCase();
      }
    }
  }
});

// Método de instância
Doctor.prototype.getActiveAppointments = async function() {
  return await this.getAppointments({
    where: {
      status: ['scheduled', 'confirmed'],
      date: { [Op.gte]: new Date() }
    }
  });
};

module.exports = Doctor;
