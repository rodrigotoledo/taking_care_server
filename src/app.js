const express = require('express');
const cors = require('cors');
const sequelize = require('../config/sequelize');
const apiRoutes = require('./routes/api');
const { DataTypes } = require('sequelize');

sequelize.sync({ alter: true })
  .then(() => console.log(`Database ${process.env.APP_NAME} synced!`))
  .catch(err => console.error("Sync failed:", err));

// Após definir todos os modelos:
const { Patient, Doctor, Appointment, Pathology } = require('./models');

// Médico tem muitos Atendimentos
Doctor.hasMany(Appointment, {
  foreignKey: 'doctorId',
  as: 'appointments' // Alias para a associação
});

// Atendimento pertence a um Médico
Appointment.belongsTo(Doctor, {
  foreignKey: 'doctorId',
  as: 'doctor'
});

// Paciente tem muitos Atendimentos
Patient.hasMany(Appointment, {
  foreignKey: 'patientId',
  as: 'appointments'
});

// Atendimento pertence a um Paciente
Appointment.belongsTo(Patient, {
  foreignKey: 'patientId',
  as: 'patient'
});

// Relação muitos-para-muitos: Paciente <-> Patologia
const PatientPathology = sequelize.define('PatientPathology', {
  diagnosisDate: DataTypes.DATEONLY,
  notes: DataTypes.TEXT
});

Patient.belongsToMany(Pathology, {
  through: PatientPathology,
  as: 'pathologies'
});

Pathology.belongsToMany(Patient, {
  through: PatientPathology,
  as: 'patients'
});

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api', apiRoutes);

module.exports = app;
