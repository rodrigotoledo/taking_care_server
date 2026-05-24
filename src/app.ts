import express from 'express'
import cors from 'cors'
import path from 'path'
import { DataTypes } from 'sequelize'
import sequelize = require('../config/sequelize')
import apiRoutes = require('./routes/api')
import authRoutes from './modules/auth/auth.routes'
import './modules/auth/models'

const { Patient, Doctor, Appointment, Pathology } = require('./models')

// Legacy domain associations
Doctor.hasMany(Appointment, {
  foreignKey: 'doctorId',
  as: 'appointments',
})

Appointment.belongsTo(Doctor, {
  foreignKey: 'doctorId',
  as: 'doctor',
})

Patient.hasMany(Appointment, {
  foreignKey: 'patientId',
  as: 'appointments',
})

Appointment.belongsTo(Patient, {
  foreignKey: 'patientId',
  as: 'patient',
})

const PatientPathology =
  sequelize.models.PatientPathology ||
  sequelize.define('PatientPathology', {
    diagnosisDate: DataTypes.DATEONLY,
    notes: DataTypes.TEXT,
  })

Patient.belongsToMany(Pathology, {
  through: PatientPathology,
  as: 'pathologies',
})

Pathology.belongsToMany(Patient, {
  through: PatientPathology,
  as: 'patients',
})

sequelize
  .sync({ alter: true })
  .then(() => console.log(`Database ${process.env.APP_NAME} synced!`))
  .catch((err: unknown) => console.error('Sync failed:', err))

const app = express()

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')))

app.use('/api/auth', authRoutes)
app.use('/api', apiRoutes)

export default app
