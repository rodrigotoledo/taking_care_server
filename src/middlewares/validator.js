const Joi = require('joi');
const { cpf } = require('cpf-cnpj-validator');

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
    location: Joi.string().trim().min(3).max(255).required(),
    professional: Joi.string().trim().min(3).max(255).required(),
    specialty: Joi.string().trim().min(2).max(255).required(),
    date: Joi.date().iso().required(),
    time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
    notes: Joi.string().max(500)
  })
};

module.exports = {
  validateRequest: (schemaName) => (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(500).json({ error: 'Validation Schema Not Found' });
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
