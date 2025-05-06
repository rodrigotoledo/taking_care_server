const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize')

const Pathology = sequelize.define('Pathology', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  icd10: {
    type: DataTypes.STRING(10),
  },
  severity: {
    type: DataTypes.ENUM('lower', 'moderate', 'grave'),
    defaultValue: 'moderate'
  },
  isChronic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  symptoms: {
    type: DataTypes.TEXT,
  },
  treatment: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'pathologies',
  timestamps: true
});

module.exports = Pathology;
