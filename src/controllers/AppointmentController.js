const { Appointment, Patient, Doctor } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');
const { sendNotification } = require('../services/notificationService');

module.exports = {
  async create(req, res) {
    try {
      const { doctorId, patientId, date, notes } = req.body;

      // 1. Checks time conflict
      const existingAppointment = await Appointment.findOne({
        where: {
          doctorId,
          date: {
            [Op.between]: [
              moment(date).subtract(29, 'minutes').toDate(),
              moment(date).add(29, 'minutes').toDate()
            ]
          },
          status: { [Op.in]: ['scheduled', 'confirmed'] }
        }
      });

      if (existingAppointment) {
        return res.status(409).json({
          error: 'Time conflict',
          conflictingAppointment: {
            id: existingAppointment.id,
            date: existingAppointment.date
          }
        });
      }

      // 2. Check if the doctor is available at this time
      const doctor = await Doctor.findByPk(doctorId);
      if (!doctor.availability) {
        return res.status(400).json({ error: 'Doctor has no registered availability' });
      }

      const appointmentDay = moment(date).format('ddd').toLowerCase().substring(0, 3);
      const availableHours = doctor.availability[appointmentDay];

      if (!availableHours) {
        return res.status(400).json({ error: 'Doctor does not attend this day' });
      }

      const appointmentHour = moment(date).hours();
      if (appointmentHour < availableHours[0] || appointmentHour >= availableHours[1]) {
        return res.status(400).json({
          error: 'Out of time available',
          availableHours
        });
      }

      // 3. Cria o agendamento
      const appointment = await Appointment.create({
        doctorId,
        patientId,
        date,
        notes,
        status: 'scheduled'
      });

      // 4. Notifica as partes (médico e paciente)
      await sendNotification({
        type: 'APPOINTMENT_CREATED',
        appointmentId: appointment.id
      });

      return res.status(201).json(appointment);

    } catch (error) {
      return res.status(400).json({
        error: 'Failure when creating Appointment',
        details: error.message
      });
    }
  },

  async cancel(req, res) {
    try {
      const appointment = await Appointment.findByPk(req.params.id);
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      if (appointment.status === 'cancelado') {
        return res.status(400).json({ error: 'Appointment already canceled' });
      }

      await appointment.update({
        status: 'canceled',
        cancellationReason: req.body.reason || 'Canceled by the patient'
      });

      await sendNotification({
        type: 'APPOINTMENT_CANCELED',
        appointmentId: appointment.id,
        reason: req.body.reason
      });

      return res.json(appointment);
    } catch (error) {
      return res.status(400).json({
        error: 'Failure to cancel appointment',
        details: error.message
      });
    }
  },

  async complete(req, res) {
    try {
      const appointment = await Appointment.findByPk(req.params.id, {
        include: [
          { model: Patient, as: 'patient' },
          { model: Doctor, as: 'doctor' }
        ]
      });

      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      if (appointment.status === 'cancelado') {
        return res.status(400).json({ error: 'Appointment its canceled' });
      }

      if (moment(appointment.date).isAfter(moment())) {
        return res.status(400).json({ error: 'Future Appointment cannot be completed' });
      }

      await appointment.update({
        status: 'finished',
        prescription: req.body.prescription,
        notes: req.body.notes
      });

      const receipt = {
        patient: appointment.patient.name,
        doctor: appointment.doctor.name,
        date: appointment.date,
        prescription: appointment.prescription
      };

      return res.json({ appointment, receipt });
    } catch (error) {
      return res.status(400).json({
        error: 'Failure when completing Appointment',
        details: error.message
      });
    }
  },

  async filter(req, res) {
    try {
      const {
        doctorId,
        patientId,
        status,
        startDate,
        endDate,
        page = 1,
        limit = 20
      } = req.query;

      const where = {};
      if (doctorId) where.doctorId = doctorId;
      if (patientId) where.patientId = patientId;
      if (status) where.status = status;

      // Filtro por data
      if (startDate && endDate) {
        where.date = {
          [Op.between]: [
            moment(startDate).startOf('day').toDate(),
            moment(endDate).endOf('day').toDate()
          ]
        };
      } else if (startDate) {
        where.date = { [Op.gte]: moment(startDate).startOf('day').toDate() };
      } else if (endDate) {
        where.date = { [Op.lte]: moment(endDate).endOf('day').toDate() };
      }

      const appointments = await Appointment.findAndCountAll({
        where,
        include: [
          {
            model: Patient,
            as: 'patient',
            attributes: ['name', 'id']
          },
          {
            model: Doctor,
            as: 'doctor',
            attributes: ['name', 'specialty']
          }
        ],
        order: [['date', 'DESC']],
        offset: (page - 1) * limit,
        limit: parseInt(limit)
      });

      return res.json({
        total: appointments.count,
        pages: Math.ceil(appointments.count / limit),
        data: appointments.rows
      });
    } catch (error) {
      return res.status(400).json({
        error: 'Failure when filtering appointments',
        details: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const appointment = await Appointment.findByPk(req.params.id, {
        include: [
          {
            model: Patient,
            as: 'patient',
            attributes: { exclude: ['password'] }
          },
          {
            model: Doctor,
            as: 'doctor',
            attributes: { exclude: ['password'] }
          }
        ]
      });

      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      return res.json(appointment);
    } catch (error) {
      return res.status(400).json({
        error: 'Failure when searching Appointment',
        details: error.message
      });
    }
  }
};
