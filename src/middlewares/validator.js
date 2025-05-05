const Joi = require('joi');
const { cpf } = require('cpf-cnpj-validator');

// Schemas reutilizáveis
const schemas = {
  createPatient: Joi.object({
    name: Joi.string().min(3).required(),
    cpf: Joi.string().custom((value, helpers) => {
      if (!cpf.isValid(value)) return helpers.error('any.invalid');
      return value;
    }).required(),
    birthDate: Joi.date().iso().max('now').required(),
    email: Joi.string().email().required()
  }),

  createAppointment: Joi.object({
    doctorId: Joi.number().integer().required(),
    patientId: Joi.number().integer().required(),
    date: Joi.date().iso().greater('now').required(),
    notes: Joi.string().max(500)
  })
};

module.exports = {
  validateRequest: (schemaName) => (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(500).json({ error: 'Schema de validação não encontrado' });
    }

    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));
      return res.status(422).json({ errors });
    }

    next();
  }
};
