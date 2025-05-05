const { Patient, Appointment, Pathology } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  /**
   * Cria um novo paciente
   */
  async create(req, res) {
    try {
      const patient = await Patient.create(req.body);
      return res.status(201).json(patient);
    } catch (error) {
      return res.status(400).json({
        error: 'Falha ao criar paciente',
        details: error.message
      });
    }
  },

  /**
   * Lista todos os pacientes (com paginação)
   */
  async list(req, res) {
    const { page = 1, limit = 10 } = req.query;
    try {
      const patients = await Patient.findAndCountAll({
        offset: (page - 1) * limit,
        limit: parseInt(limit),
        order: [['name', 'ASC']]
      });
      return res.json({
        total: patients.count,
        pages: Math.ceil(patients.count / limit),
        data: patients.rows
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar pacientes' });
    }
  },

  /**
   * Busca paciente por ID
   */
  async getById(req, res) {
    try {
      const patient = await Patient.findByPk(req.params.id, {
        include: [{
          model: Pathology,
          as: 'pathologies',
          through: { attributes: [] } // Oculta tabela intermediária
        }]
      });
      if (!patient) {
        return res.status(404).json({ error: 'Paciente não encontrado' });
      }
      return res.json(patient);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar paciente' });
    }
  },

  /**
   * Atualiza paciente
   */
  async update(req, res) {
    try {
      const [updated] = await Patient.update(req.body, {
        where: { id: req.params.id }
      });
      if (!updated) {
        return res.status(404).json({ error: 'Paciente não encontrado' });
      }
      const patient = await Patient.findByPk(req.params.id);
      return res.json(patient);
    } catch (error) {
      return res.status(400).json({ error: 'Falha ao atualizar paciente' });
    }
  },

  /**
   * Remove paciente (soft delete)
   */
  async delete(req, res) {
    try {
      const deleted = await Patient.destroy({
        where: { id: req.params.id }
      });
      if (!deleted) {
        return res.status(404).json({ error: 'Paciente não encontrado' });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Falha ao remover paciente' });
    }
  },

  /**
   * Lista atendimentos do paciente
   */
  async getAppointments(req, res) {
    const { status } = req.query;
    try {
      const where = { patientId: req.params.id };
      if (status) where.status = status;

      const appointments = await Appointment.findAll({
        where,
        include: [{
          model: Doctor,
          as: 'doctor',
          attributes: ['name', 'specialty']
        }],
        order: [['date', 'DESC']]
      });
      return res.json(appointments);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar atendimentos' });
    }
  },

  /**
   * Associa patologia ao paciente
   */
  async addPathology(req, res) {
    try {
      const patient = await Patient.findByPk(req.params.id);
      if (!patient) {
        return res.status(404).json({ error: 'Paciente não encontrado' });
      }

      await patient.addPathology(req.body.pathologyId, {
        through: {
          diagnosisDate: req.body.diagnosisDate || new Date(),
          notes: req.body.notes
        }
      });
      return res.status(201).json({ success: true });
    } catch (error) {
      return res.status(400).json({
        error: 'Falha na associação',
        details: error.message
      });
    }
  }
};
