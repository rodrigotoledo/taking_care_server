const Joi = require('joi');
const cid10Codes = require('./cid10');

module.exports = {
  /**
   * Valida código CID-10
   * Formato: Letra + 2 dígitos (ex: E11, F32)
   */
  cid10: Joi.string()
    .uppercase()
    .length(3)
    .custom((value, helpers) => {
      if (!cid10Codes.includes(value)) {
        return helpers.error('any.invalid', { value });
      }
      return value;
    }, 'CID-10 Validation')
    .messages({
      'any.invalid': 'Código CID-10 inválido: {{#value}}',
      'string.length': 'CID-10 deve ter exatamente 3 caracteres'
    }),

  /**
   * Valida se é um CID-10 ou descrição de patologia
   */
  pathology: Joi.alternatives().try(
    Joi.string().min(3).max(100), // Descrição textual
    this.cid10 // Ou código CID-10 válido
  )
};
