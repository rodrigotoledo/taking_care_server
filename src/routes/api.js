const express = require('express');
const router = express.Router();
const {
  AuthController,
  PatientController,
  DoctorController,
  AppointmentController,
  PathologyController
} = require('../controllers');

// ===== [ MIDDLEWARES ] =====
const { validateRequest } = require('../middlewares/validator');
const { authenticate } = require('../middlewares/auth');

router.post('/login', AuthController.login);
router.post('/logout', (req, res) => {
  // Na prática, o logout é client-side (apagar o token)
  return res.json({ message: 'Logout realizado' });
});

// ===== [ PACIENTES ] =====
router.post('/patients', validateRequest('createPatient'), PatientController.create);
router.get('/patients', authenticate, PatientController.list);
router.get('/patients/:id', authenticate, PatientController.getById);
router.put('/patients/:id', authenticate, validateRequest('updatePatient'), PatientController.update);
router.delete('/patients/:id', authenticate, PatientController.delete);
router.get('/patients/:id/appointments', authenticate, PatientController.getAppointments);
router.post('/patients/:id/pathologies', authenticate, PatientController.addPathology);

// ===== [ MÉDICOS ] =====
router.post('/doctors', validateRequest('createDoctor'), DoctorController.create);
router.get('/doctors', authenticate, DoctorController.list);
router.get('/doctors/:id', authenticate, DoctorController.getById);
router.get('/doctors/:id/appointments', authenticate, DoctorController.getAppointments);
router.put('/doctors/:id/availability', authenticate, DoctorController.updateAvailability);

// ===== [ ATENDIMENTOS ] =====
router.post('/appointments', authenticate, validateRequest('createAppointment'), AppointmentController.create);
router.put('/appointments/:id/cancel', authenticate, AppointmentController.cancel);
router.put('/appointments/:id/complete', authenticate, AppointmentController.complete);
router.get('/appointments', authenticate, AppointmentController.filter);
router.get('/appointments/:id', authenticate, AppointmentController.getById);

// ===== [ PATOLOGIAS ] =====
router.get('/pathologies', PathologyController.list);
router.post('/pathologies', authenticate, PathologyController.create);
router.get('/pathologies/:id/patients', authenticate, PathologyController.getPatients);

module.exports = router;
