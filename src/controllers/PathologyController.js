const { Pathology, Patient, PatientPathology } = require('../models');
const { Op } = require('sequelize');
const Joi = require('joi');
const { cid10Codes } = require('../utils/cid10'); // Array com códigos CID-10 válidos

module.exports = {
  /**
   * Lista todas as patologias com filtros
   * GET /pathologies
   */
  async list(req, res) {
    try {
      const { search, isChronic, page = 1, limit = 20 } = req.query;

      const where = {};
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { icd10: { [Op.iLike]: `%${search}%` } }
        ];
      }
      if (isChronic) where.isChronic = isChronic === 'true';

      const pathologies = await Pathology.findAndCountAll({
        where,
        order: [['name', 'ASC']],
        offset: (page - 1) * limit,
        limit: parseInt(limit),
        include: [{
          model: Patient,
          as: 'patients',
          through: { attributes: [] }, // Oculta dados da tabela intermediária
          attributes: ['id'] // Apenas conta os pacientes
        }]
      });

      // Adiciona contagem de pacientes a cada patologia
      const data = pathologies.rows.map(pathology => ({
        ...pathology.get({ plain: true }),
        patientCount: pathology.patients.length
      }));

      return res.json({
        total: pathologies.count,
        pages: Math.ceil(pathologies.count / limit),
        data
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao listar patologias',
        details: error.message
      });
    }
  },

  /**
   * Cria uma nova patologia
   * POST /pathologies
   */
  async create(req, res) {
    try {
      // Validação com Joi (exemplo)
      const schema = Joi.object({
        name: Joi.string().min(3).required(),
        icd10: Joi.string().custom((value, helpers) => {
          if (!cid10Codes.includes(value.toUpperCase())) {
            return helpers.error('any.invalid');
          }
          return value.toUpperCase();
        }).required(),
        isChronic: Joi.boolean().default(false),
        symptoms: Joi.string().max(500),
        treatment: Joi.string().max(500)
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: error.details
        });
      }

      // Verifica se patologia já existe
      const exists = await Pathology.findOne({
        where: {
          [Op.or]: [
            { name: value.name },
            { icd10: value.icd10 }
          ]
        }
      });

      if (exists) {
        return res.status(409).json({
          error: 'Patologia já cadastrada',
          existingPathology: {
            id: exists.id,
            name: exists.name,
            icd10: exists.icd10
          }
        });
      }

      const pathology = await Pathology.create(value);
      return res.status(201).json(pathology);
    } catch (error) {
      return res.status(400).json({
        error: 'Falha ao criar patologia',
        details: error.message
      });
    }
  },

  /**
   * Lista pacientes com determinada patologia
   * GET /pathologies/:id/patients
   */
  async getPatients(req, res) {
    try {
      const { page = 1, limit = 10, withAppointments } = req.query;

      const pathology = await Pathology.findByPk(req.params.id);
      if (!pathology) {
        return res.status(404).json({ error: 'Patologia não encontrada' });
      }

      const includeOptions = [{
        model: PatientPathology,
        as: 'patientLinks',
        where: { pathologyId: req.params.id },
        attributes: ['diagnosisDate', 'notes']
      }];

      if (withAppointments === 'true') {
        includeOptions[0].include = [{
          model: Appointment,
          as: 'appointments',
          attributes: ['id', 'date', 'status'],
          where: { status: 'realizado' },
          required: false
        }];
      }

      const patients = await Patient.findAndCountAll({
        include: includeOptions,
        attributes: ['id', 'name', 'birthDate', 'gender'],
        order: [[{ model: PatientPathology, as: 'patientLinks' }, 'diagnosisDate', 'DESC']],
        offset: (page - 1) * limit,
        limit: parseInt(limit),
        distinct: true // Corrige contagem com includes
      });

      return res.json({
        pathology: pathology.name,
        total: patients.count,
        pages: Math.ceil(patients.count / limit),
        data: patients.rows
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao buscar pacientes',
        details: error.message
      });
    }
  },

  /**
   * Estatísticas de patologias (extra)
   * GET /pathologies/stats
   */
  async stats(req, res) {
    try {
      const mostCommon = await Pathology.findAll({
        attributes: [
          'id',
          'name',
          [sequelize.fn('COUNT', sequelize.col('patients.id')), 'patientCount']
        ],
        include: [{
          model: Patient,
          as: 'patients',
          attributes: [],
          through: { attributes: [] }
        }],
        group: ['Pathology.id'],
        order: [[sequelize.literal('patientCount'), 'DESC']],
        limit: 5
      });

      const chronicStats = await Pathology.findAll({
        attributes: [
          'isChronic',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['isChronic']
      });

      return res.json({
        mostCommon,
        chronicStats
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao gerar estatísticas',
        details: error.message
      });
    }
  }
};
