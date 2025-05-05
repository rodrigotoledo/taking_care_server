// src/controllers/index.js
const AuthController = require('./AuthController');
const PatientController = require('./PatientController');
const DoctorController = require('./DoctorController');
const AppointmentController = require('./AppointmentController');
const PathologyController = require('./PathologyController');

module.exports = {
  AuthController,
  PatientController,
  DoctorController,
  AppointmentController,
  PathologyController
};
