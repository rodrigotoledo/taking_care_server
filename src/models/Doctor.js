const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize')

const Doctor = sequelize.define('Doctor', {
  // ===== DADOS PESSOAIS =====
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nome é obrigatório' }
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

  // ===== CONTATO =====
  email: {
    type: DataTypes.STRING,
    validate: { isEmail: true },
    unique: true
  },
  phone: { type: DataTypes.STRING(20) },
  emergencyPhone: { type: DataTypes.STRING(20) },

  // ===== DADOS PROFISSIONAIS =====
  specialty: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subSpecialties: {
    type: DataTypes.ARRAY(DataTypes.STRING), // PostgreSQL
    defaultValue: []
  },
  residency: { type: DataTypes.STRING },
  medicalSchool: { type: DataTypes.STRING },
  graduationYear: { type: DataTypes.INTEGER },

  // ===== DISPONIBILIDADE =====
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  availability: {
    type: DataTypes.JSONB,
  },

  // ===== DADOS DE ACESSO =====
  photoUrl: { type: DataTypes.STRING },
  bio: { type: DataTypes.TEXT }
}, {
  tableName: 'doctors',
  timestamps: true,
  paranoid: true, // Soft delete
  indexes: [
    { unique: true, fields: ['crm', 'crm_uf'] },
    { fields: ['specialty'] } // Para buscas rápidas
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
      status: ['agendado', 'confirmado'],
      date: { [Op.gte]: new Date() }
    }
  });
};

module.exports = Doctor;
