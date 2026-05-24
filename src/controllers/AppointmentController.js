const { Appointment } = require('../models');
const { Op } = require('sequelize');

const APPOINTMENT_STATUSES = ['draft', 'doing', 'completed', 'canceled'];

const requireAuthenticatedUserId = (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized access' });
    return null;
  }

  return userId;
};

const normalizeNotes = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

module.exports = {
  async create(req, res) {
    try {
      const userId = requireAuthenticatedUserId(req, res);
      if (!userId) {
        return;
      }

      const { location, professional, specialty, date, time, notes } = req.body;

      if (!location || !professional || !specialty || !date || !time) {
        return res.status(400).json({
          error: 'Missing required fields: location, professional, specialty, date, time'
        });
      }

      const existingAppointment = await Appointment.findOne({
        where: {
          userId,
          date,
          time,
          status: { [Op.in]: ['draft', 'doing'] }
        }
      });

      if (existingAppointment) {
        return res.status(409).json({
          error: 'Time conflict',
          conflictingAppointment: {
            id: existingAppointment.id,
            date: existingAppointment.date,
            time: existingAppointment.time
          }
        });
      }

      const appointment = await Appointment.create({
        userId,
        location,
        professional,
        specialty,
        date,
        time,
        notes: normalizeNotes(notes),
        status: 'draft'
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
      const userId = requireAuthenticatedUserId(req, res);
      if (!userId) {
        return;
      }

      const appointment = await Appointment.findOne({
        where: {
          id: req.params.id,
          userId,
        },
      });

      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      if (appointment.status === 'canceled') {
        return res.status(400).json({ error: 'Appointment already canceled' });
      }

      if (appointment.status === 'completed') {
        return res.status(400).json({ error: 'Completed appointment cannot be canceled' });
      }

      await appointment.update({
        status: 'canceled',
        notes: normalizeNotes(req.body.reason) || appointment.notes
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
      const userId = requireAuthenticatedUserId(req, res);
      if (!userId) {
        return;
      }

      const appointment = await Appointment.findOne({
        where: {
          id: req.params.id,
          userId,
        },
      });

      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      if (appointment.status === 'canceled') {
        return res.status(400).json({ error: 'Appointment is canceled' });
      }

      await appointment.update({
        status: 'completed',
        notes: normalizeNotes(req.body.notes) || appointment.notes
      });

      return res.json(appointment);
    } catch (error) {
      return res.status(400).json({
        error: 'Failure when completing Appointment',
        details: error.message
      });
    }
  },

  async filter(req, res) {
    try {
      const userId = requireAuthenticatedUserId(req, res);
      if (!userId) {
        return;
      }

      const {
        status,
        startDate,
        endDate,
        search,
        page = 1,
        limit = 50
      } = req.query;

      const limitNumber = Number.parseInt(limit, 10) || 50;
      const pageNumber = Number.parseInt(page, 10) || 1;

      const where = { userId };
      if (status) where.status = status;

      if (startDate && endDate) {
        where.date = {
          [Op.between]: [startDate, endDate]
        };
      } else if (startDate) {
        where.date = { [Op.gte]: startDate };
      } else if (endDate) {
        where.date = { [Op.lte]: endDate };
      }

      if (search) {
        where[Op.or] = [
          { location: { [Op.iLike]: `%${search}%` } },
          { professional: { [Op.iLike]: `%${search}%` } },
          { specialty: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const appointments = await Appointment.findAndCountAll({
        where,
        order: [['date', 'ASC'], ['time', 'ASC'], ['id', 'DESC']],
        offset: (pageNumber - 1) * limitNumber,
        limit: limitNumber
      });

      return res.json({
        total: appointments.count,
        pages: Math.ceil(appointments.count / limitNumber),
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
      const userId = requireAuthenticatedUserId(req, res);
      if (!userId) {
        return;
      }

      const appointment = await Appointment.findOne({
        where: {
          id: req.params.id,
          userId,
        },
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
  },

  async updateStatus(req, res) {
    try {
      const userId = requireAuthenticatedUserId(req, res);
      if (!userId) {
        return;
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!APPOINTMENT_STATUSES.includes(status)) {
        return res.status(400).json({
          error: 'Invalid status',
          validStatuses: APPOINTMENT_STATUSES
        });
      }

      const appointment = await Appointment.findOne({
        where: {
          id,
          userId,
        },
      });

      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      if (appointment.status === 'canceled' && status !== 'canceled') {
        return res.status(400).json({ error: 'Cannot change status of canceled appointment' });
      }

      if (appointment.status === 'completed' && status !== 'completed') {
        return res.status(400).json({ error: 'Cannot change status of completed appointment' });
      }

      await appointment.update({ status });

      return res.json(appointment);
    } catch (error) {
      return res.status(400).json({
        error: 'Failure when updating appointment status',
        details: error.message
      });
    }
  }
};
