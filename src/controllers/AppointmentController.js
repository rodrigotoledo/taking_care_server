const { Appointment, Patient, Doctor } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');
const { sendNotification } = require('../services/notificationService');

module.exports = {
  /**
   * Cria um novo agendamento
   * POST /appointments
   */
  async create(req, res) {
    try {
      const { doctorId, patientId, date, notes } = req.body;

      // 1. Verifica conflito de horário
      const existingAppointment = await Appointment.findOne({
        where: {
          doctorId,
          date: {
            [Op.between]: [
              moment(date).subtract(29, 'minutes').toDate(),
              moment(date).add(29, 'minutes').toDate()
            ]
          },
          status: { [Op.in]: ['agendado', 'confirmado'] }
        }
      });

      if (existingAppointment) {
        return res.status(409).json({
          error: 'Conflito de horário',
          conflictingAppointment: {
            id: existingAppointment.id,
            date: existingAppointment.date
          }
        });
      }

      // 2. Verifica se o médico está disponível nesse horário
      const doctor = await Doctor.findByPk(doctorId);
      if (!doctor.availability) {
        return res.status(400).json({ error: 'Médico não tem disponibilidade cadastrada' });
      }

      const appointmentDay = moment(date).format('ddd').toLowerCase().substring(0, 3);
      const availableHours = doctor.availability[appointmentDay];

      if (!availableHours) {
        return res.status(400).json({ error: 'Médico não atende neste dia' });
      }

      const appointmentHour = moment(date).hours();
      if (appointmentHour < availableHours[0] || appointmentHour >= availableHours[1]) {
        return res.status(400).json({
          error: 'Fora do horário disponível',
          availableHours
        });
      }

      // 3. Cria o agendamento
      const appointment = await Appointment.create({
        doctorId,
        patientId,
        date,
        notes,
        status: 'agendado'
      });

      // 4. Notifica as partes (médico e paciente)
      await sendNotification({
        type: 'APPOINTMENT_CREATED',
        appointmentId: appointment.id
      });

      return res.status(201).json(appointment);

    } catch (error) {
      return res.status(400).json({
        error: 'Falha ao criar agendamento',
        details: error.message
      });
    }
  },

  /**
   * Cancela um agendamento
   * PUT /appointments/:id/cancel
   */
  async cancel(req, res) {
    try {
      const appointment = await Appointment.findByPk(req.params.id);
      if (!appointment) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }

      // Valida se já não está cancelado
      if (appointment.status === 'cancelado') {
        return res.status(400).json({ error: 'Agendamento já cancelado' });
      }

      // Atualiza status
      await appointment.update({
        status: 'cancelado',
        cancellationReason: req.body.reason || 'Cancelado pelo paciente'
      });

      // Notifica cancelamento
      await sendNotification({
        type: 'APPOINTMENT_CANCELED',
        appointmentId: appointment.id,
        reason: req.body.reason
      });

      return res.json(appointment);
    } catch (error) {
      return res.status(400).json({
        error: 'Falha ao cancelar agendamento',
        details: error.message
      });
    }
  },

  /**
   * Marca atendimento como completo
   * PUT /appointments/:id/complete
   */
  async complete(req, res) {
    try {
      const appointment = await Appointment.findByPk(req.params.id, {
        include: [
          { model: Patient, as: 'patient' },
          { model: Doctor, as: 'doctor' }
        ]
      });

      if (!appointment) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }

      // Validações
      if (appointment.status === 'cancelado') {
        return res.status(400).json({ error: 'Atendimento cancelado não pode ser completado' });
      }

      if (moment(appointment.date).isAfter(moment())) {
        return res.status(400).json({ error: 'Atendimento futuro não pode ser completado' });
      }

      // Atualiza com dados do atendimento
      await appointment.update({
        status: 'realizado',
        prescription: req.body.prescription,
        notes: req.body.notes
      });

      // Gera recibo (exemplo simplificado)
      const receipt = {
        patient: appointment.patient.name,
        doctor: appointment.doctor.name,
        date: appointment.date,
        prescription: appointment.prescription
      };

      return res.json({ appointment, receipt });
    } catch (error) {
      return res.status(400).json({
        error: 'Falha ao completar atendimento',
        details: error.message
      });
    }
  },

  /**
   * Filtra agendamentos
   * GET /appointments
   */
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
        error: 'Falha ao filtrar agendamentos',
        details: error.message
      });
    }
  },

  /**
   * Busca agendamento por ID
   * GET /appointments/:id
   */
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
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }

      return res.json(appointment);
    } catch (error) {
      return res.status(400).json({
        error: 'Falha ao buscar agendamento',
        details: error.message
      });
    }
  }
};
