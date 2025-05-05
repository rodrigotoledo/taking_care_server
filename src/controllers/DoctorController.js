const { Doctor, Appointment } = require('../models');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

module.exports = {
  /**
   * Cria um novo médico
   * POST /doctors
   */
  async create(req, res) {
    try {
      // Verifica CRM único
      const existingDoctor = await Doctor.findOne({
        where: {
          crm: req.body.crm,
          crmUf: req.body.crmUf.toUpperCase()
        }
      });

      if (existingDoctor) {
        return res.status(409).json({
          error: 'CRM já cadastrado nesta UF'
        });
      }

      const doctor = await Doctor.create({
        ...req.body,
        crmUf: req.body.crmUf.toUpperCase()
      });

      // Gera token JWT para autenticação imediata
      const token = jwt.sign(
        { id: doctor.id, type: 'doctor' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      return res.status(201).json({ doctor, token });
    } catch (error) {
      return res.status(400).json({
        error: 'Falha ao cadastrar médico',
        details: error.message
      });
    }
  },

  /**
   * Lista médicos com filtros
   * GET /doctors
   */
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
        attributes: { exclude: ['password'] }, // Remove dados sensíveis
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
        error: 'Erro ao buscar médicos',
        details: error.message
      });
    }
  },

  /**
   * Busca médico por ID
   * GET /doctors/:id
   */
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
        return res.status(404).json({ error: 'Médico não encontrado' });
      }

      return res.json(doctor);
    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao buscar médico',
        details: error.message
      });
    }
  },

  /**
   * Lista atendimentos do médico
   * GET /doctors/:id/appointments
   */
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
        error: 'Erro ao buscar agenda',
        details: error.message
      });
    }
  },

  /**
   * Atualiza disponibilidade do médico
   * PUT /doctors/:id/availability
   */
  async updateAvailability(req, res) {
    try {
      // Validação básica da estrutura
      if (!req.body.availability || typeof req.body.availability !== 'object') {
        return res.status(400).json({
          error: 'Formato inválido. Use { dia: [horaInicio, horaFim] }'
        });
      }

      const [updated] = await Doctor.update(
        { availability: req.body.availability },
        { where: { id: req.params.id } }
      );

      if (!updated) {
        return res.status(404).json({ error: 'Médico não encontrado' });
      }

      return res.json({
        success: true,
        availability: req.body.availability
      });
    } catch (error) {
      return res.status(400).json({
        error: 'Falha ao atualizar disponibilidade',
        details: error.message
      });
    }
  }
};
