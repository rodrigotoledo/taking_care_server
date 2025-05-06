const { Doctor, Appointment } = require('../models');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

module.exports = {
  async create(req, res) {
    try {
      const existingDoctor = await Doctor.findOne({
        where: {
          crm: req.body.crm,
          crmUf: req.body.crmUf.toUpperCase()
        }
      });

      if (existingDoctor) {
        return res.status(409).json({
          error: 'CRM already registered in this UF'
        });
      }

      const doctor = await Doctor.create({
        ...req.body,
        crmUf: req.body.crmUf.toUpperCase()
      });

      const token = jwt.sign(
        { id: doctor.id, type: 'doctor' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      return res.status(201).json({ doctor, token });
    } catch (error) {
      return res.status(400).json({
        error: 'Failure to register doctor',
        details: error.message
      });
    }
  },

  async list(req, res) {
    const { specialty, search, page = 1, limit = 10 } = req.query;

    try {
      const where = {};
      if (specialty) where.specialty = specialty;
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { crm: search }
        ];
      }

      const doctors = await Doctor.findAndCountAll({
        where,
        attributes: { exclude: ['password'] },
        offset: (page - 1) * limit,
        limit: parseInt(limit),
        order: [['name', 'ASC']]
      });

      return res.json({
        total: doctors.count,
        pages: Math.ceil(doctors.count / limit),
        data: doctors.rows
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Error when seeking doctors',
        details: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const doctor = await Doctor.findByPk(req.params.id, {
        attributes: { exclude: ['password'] },
        include: [{
          model: Appointment,
          as: 'appointments',
          limit: 5,
          order: [['date', 'DESC']]
        }]
      });

      if (!doctor) {
        return res.status(404).json({ error: 'Non found doctor' });
      }

      return res.json(doctor);
    } catch (error) {
      return res.status(500).json({
        error: 'Error when searching for a doctor',
        details: error.message
      });
    }
  },

  async getAppointments(req, res) {
    const { status, startDate, endDate } = req.query;

    try {
      const where = { doctorId: req.params.id };

      if (status) where.status = status;
      if (startDate && endDate) {
        where.date = {
          [Op.between]: [
            new Date(startDate),
            new Date(endDate + 'T23:59:59')
          ]
        };
      }

      const appointments = await Appointment.findAll({
        where,
        include: [{
          model: Patient,
          as: 'patient',
          attributes: ['name', 'id']
        }],
        order: [['date', 'ASC']]
      });

      return res.json(appointments);
    } catch (error) {
      return res.status(500).json({
        error: 'Error when searching Appointment',
        details: error.message
      });
    }
  },

  async updateAvailability(req, res) {
    try {
      if (!req.body.availability || typeof req.body.availability !== 'object') {
        return res.status(400).json({
          error: 'Invalid format.Use {day: [startHour, endHour]}'
        });
      }

      const [updated] = await Doctor.update(
        { availability: req.body.availability },
        { where: { id: req.params.id } }
      );

      if (!updated) {
        return res.status(404).json({ error: 'Non -found doctor' });
      }

      return res.json({
        success: true,
        availability: req.body.availability
      });
    } catch (error) {
      return res.status(400).json({
        error: 'Failure to update availability',
        details: error.message
      });
    }
  }
};
