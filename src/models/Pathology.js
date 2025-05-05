const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize')

const Pathology = sequelize.define('Pathology', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Nome da patologia (ex: Diabetes, Hipertensão)'
  },
  icd10: {
    type: DataTypes.STRING(10),
    comment: 'Código CID-10 da doença'
  },
  severity: {
    type: DataTypes.ENUM('leve', 'moderada', 'grave'),
    defaultValue: 'moderada'
  },
  isChronic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Se é uma condição crônica'
  },
  symptoms: {
    type: DataTypes.TEXT,
    comment: 'Sintomas associados'
  },
  treatment: {
    type: DataTypes.TEXT,
    comment: 'Tratamento recomendado'
  },
}, {
  tableName: 'pathologies',
  timestamps: true
});

module.exports = Pathology;
