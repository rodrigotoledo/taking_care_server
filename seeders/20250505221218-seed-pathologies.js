'use strict';

const { faker } = require('@faker-js/faker/locale/pt_BR');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('pathologies', null, {});

    const pathologyNames = [
      'Hipertensão arterial', 'Diabetes mellitus', 'Asma brônquica', 'Osteoartrite',
      'Depressão maior', 'Ansiedade generalizada', 'Gastrite crônica', 'Hipotireoidismo',
      'Doença pulmonar obstrutiva crônica', 'Insuficiência cardíaca congestiva',
      'Artrite reumatoide', 'Osteoporose', 'Enxaqueca crônica', 'Doença de Alzheimer',
      'Doença de Parkinson', 'Esclerose múltipla', 'Lúpus eritematoso sistêmico',
      'Doença de Crohn', 'Retocolite ulcerativa', 'Cirrose hepática'
    ];

    const pathologies = [];
    const usedIcd10 = new Set();

    for (let i = 0; i < pathologyNames.length; i++) {
      const name = pathologyNames[i];
      const isChronic = faker.datatype.boolean(0.7);

      let icd10;
      do {
        icd10 = `E${faker.number.int({ min: 10, max: 99 })}.${faker.number.int({ min: 0, max: 9 })}`;
      } while (usedIcd10.has(icd10));
      usedIcd10.add(icd10);

      pathologies.push({
        name: name,
        icd10: icd10,
        severity: faker.helpers.arrayElement(['lower', 'moderate', 'grave']),
        is_chronic: isChronic,
        symptoms: faker.lorem.paragraph() + '\n' + faker.lorem.paragraph(),
        treatment: isChronic
          ? faker.lorem.paragraph() + '\nMedicação contínua: ' + faker.helpers.arrayElements([
            'Metformina', 'Losartana', 'AAS', 'Sinvastatina', 'Omeprazol',
            'Sertralina', 'Levotiroxina', 'Salbutamol', 'Insulina'
          ], { min: 1, max: 3 }).join(', ')
          : faker.lorem.paragraph() + '\nTratamento por: ' + faker.number.int({ min: 7, max: 30 }) + ' dias',
        created_at: faker.date.past({ years: 10 }),
        updated_at: faker.date.recent({ days: 365 })
      });
    }

    await queryInterface.bulkInsert('pathologies', pathologies);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('pathologies', null, {});
  }
};
