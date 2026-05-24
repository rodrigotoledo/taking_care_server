const express = require('express');
const cors = require('cors');
const sequelize = require('../config/sequelize');
const apiRoutes = require('./routes/api');
const { DataTypes } = require('sequelize');
const { User } = require('./modules/auth/models');

sequelize.sync({ alter: true })
  .then(() => console.log(`Database ${process.env.APP_NAME} synced!`))
  .catch(err => console.error("Sync failed:", err));

// Após definir todos os modelos:
const { Patient, Appointment, Pathology } = require('./models');

User.hasMany(Appointment, {
  foreignKey: 'userId',
  as: 'appointments'
});

Appointment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
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
