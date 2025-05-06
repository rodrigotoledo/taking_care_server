'use strict';
const { faker } = require('@faker-js/faker/locale/pt_BR');

module.exports = {
  async up (queryInterface) {
    const patients = [];
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const genders = ['M', 'F', 'Other', 'Prefer not to say'];

    let firstName = ''
    let lastName = ''
    let specialty = ''
    let uf = '';

    for (let i = 0; i < 50; i++) {
      firstName = faker.person.firstName();
      lastName = faker.person.lastName();

      patients.push({
        name: `${firstName} ${lastName}`,
        cpf: faker.string.numeric(11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
        birth_date: faker.date.birthdate({ min: 18, max: 90, mode: 'age' }),
        gender: faker.helpers.arrayElement(genders),
        address: `${faker.location.streetAddress()}, ${faker.location.city()} - ${faker.location.state()}`,
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        password: 'password@example123',
        password_confirmation: 'password@example123',
        phone: faker.phone.number('+55 ## 9#### ####'),
        fcm_tokens: [faker.string.alphanumeric(152)],
        blood_type: faker.helpers.arrayElement(bloodTypes),
        allergies: faker.helpers.arrayElements([
          'Penicilina', 'Amoxicilina', 'Dipirona', 'Ibuprofeno',
          'Paracetamol', 'Sulfa', 'Latex', 'Amendoim', 'Frutos do mar'
        ], { min: 0, max: 3 }).join(', '),
        is_active: faker.datatype.boolean(0.9), // 90% de chance de estar ativo
        created_at: faker.date.past({ years: 2 }),
        updated_at: faker.date.recent({ days: 60 })
      });
    }

    firstName = faker.person.firstName();
    lastName = faker.person.lastName();

    patients.push({
      name: `${firstName} ${lastName}`,
      cpf: faker.string.numeric(11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
      birth_date: faker.date.birthdate({ min: 18, max: 90, mode: 'age' }),
      gender: faker.helpers.arrayElement(genders),
      address: `${faker.location.streetAddress()}, ${faker.location.city()} - ${faker.location.state()}`,
      email: 'patient@example.com',
      password: 'example',
      password_confirmation: 'example',
      phone: faker.phone.number('+55 ## 9#### ####'),
      fcm_tokens: [faker.string.alphanumeric(152)],
      blood_type: faker.helpers.arrayElement(bloodTypes),
      allergies: faker.helpers.arrayElements([
        'Penicilina', 'Amoxicilina', 'Dipirona', 'Ibuprofeno',
        'Paracetamol', 'Sulfa', 'Latex', 'Amendoim', 'Frutos do mar'
      ], { min: 0, max: 3 }).join(', '),
      is_active: faker.datatype.boolean(0.9), // 90% de chance de estar ativo
      created_at: faker.date.past({ years: 2 }),
      updated_at: faker.date.recent({ days: 60 })
    });

    await queryInterface.bulkInsert('patients', patients);

    await queryInterface.sequelize.query('SET CONSTRAINTS ALL DEFERRED;'); // Desativa temporariamente constraints

    const doctors = [];
    const specialties = [
      'Cardiologia', 'Dermatologia', 'Endocrinologia', 'Gastroenterologia',
      'Neurologia', 'Ortopedia', 'Pediatria', 'Psiquiatria', 'Radiologia'
    ];
    const ufList = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
                   'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
                   'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];


    for (let i = 0; i < 20; i++) {
      firstName = faker.person.firstName();
      lastName = faker.person.lastName();
      specialty = faker.helpers.arrayElement(specialties);
      uf = faker.helpers.arrayElement(ufList);

      doctors.push({
        name: `Dr. ${firstName} ${lastName}`,
        crm: faker.string.numeric(6),
        crm_uf: uf,
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        password: 'password@example123',
        password_confirmation: 'password@example123',
        phone: faker.phone.number('+55 ## 9#### ####'),
        emergency_phone: faker.phone.number('+55 ## 3### ####'),
        specialty: specialty,
        sub_specialties: faker.helpers.arrayElements([
          'Cirurgia', 'Oncologia', 'Geriatria', 'Medicina Esportiva',
          'Medicina do Trabalho', 'Nutrologia'
        ], { min: 1, max: 3 }),
        residency: faker.helpers.arrayElement([
          'Hospital das Clínicas', 'Santa Casa', 'Instituto do Câncer',
          'Hospital Albert Einstein', 'Hospital Sírio-Libanês'
        ]),
        medical_school: faker.helpers.arrayElement([
          'USP', 'UNIFESP', 'UFMG', 'UFRJ', 'UFBA', 'UFC', 'UFPR'
        ]),
        graduation_year: faker.number.int({ min: 1980, max: 2020 }),
        is_active: faker.datatype.boolean(0.8), // 80% de chance de estar ativo
        availability: {
          days: faker.helpers.arrayElements([
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday'
          ], {
            min: 3,
            max: 5
          }),
          hours: {
            start: faker.number.int({ min: 7, max: 12 }),
            end: faker.number.int({ min: 12, max: 23 })
          }
        },
        photo_url: faker.image.avatar(),
        bio: faker.lorem.paragraphs(2),
        created_at: faker.date.past({ years: 5 }),
        updated_at: faker.date.recent({ days: 180 })
      });
    }

    firstName = faker.person.firstName();
    lastName = faker.person.lastName();
    specialty = faker.helpers.arrayElement(specialties);
    uf = faker.helpers.arrayElement(ufList);

    doctors.push({
      name: `Dr. ${firstName} ${lastName}`,
      crm: faker.string.numeric(6),
      crm_uf: uf,
      email: 'doctor@example.com',
      password: 'password@example123',
      password_confirmation: 'password@example123',
      phone: faker.phone.number('+55 ## 9#### ####'),
      emergency_phone: faker.phone.number('+55 ## 3### ####'),
      specialty: specialty,
      sub_specialties: faker.helpers.arrayElements([
        'Cirurgia', 'Oncologia', 'Geriatria', 'Medicina Esportiva',
        'Medicina do Trabalho', 'Nutrologia'
      ], { min: 1, max: 3 }),
      residency: faker.helpers.arrayElement([
        'Hospital das Clínicas', 'Santa Casa', 'Instituto do Câncer',
        'Hospital Albert Einstein', 'Hospital Sírio-Libanês'
      ]),
      medical_school: faker.helpers.arrayElement([
        'USP', 'UNIFESP', 'UFMG', 'UFRJ', 'UFBA', 'UFC', 'UFPR'
      ]),
      graduation_year: faker.number.int({ min: 1980, max: 2020 }),
      is_active: faker.datatype.boolean(0.8), // 80% de chance de estar ativo
      availability: {
        days: faker.helpers.arrayElements([
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday'
        ], {
          min: 3,
          max: 5
        }),
        hours: {
          start: faker.number.int({ min: 7, max: 12 }),
          end: faker.number.int({ min: 12, max: 23 })
        }
      },
      photo_url: faker.image.avatar(),
      bio: faker.lorem.paragraphs(2),
      created_at: faker.date.past({ years: 5 }),
      updated_at: faker.date.recent({ days: 180 })
    });

    await queryInterface.bulkInsert('doctors',
      doctors.map(d => ({
        ...d,
        availability: JSON.stringify(d.availability) // Conversão explícita para string JSON
      }))
    );

    const pathologies = [];
    const pathologyNames = [
      'Hipertensão arterial', 'Diabetes mellitus', 'Asma brônquica', 'Osteoartrite',
      'Depressão maior', 'Ansiedade generalizada', 'Gastrite crônica', 'Hipotireoidismo',
      'Doença pulmonar obstrutiva crônica', 'Insuficiência cardíaca congestiva',
      'Artrite reumatoide', 'Osteoporose', 'Enxaqueca crônica', 'Doença de Alzheimer',
      'Doença de Parkinson', 'Esclerose múltipla', 'Lúpus eritematoso sistêmico',
      'Doença de Crohn', 'Retocolite ulcerativa', 'Cirrose hepática'
    ];

    for (let i = 0; i < pathologyNames.length; i++) {
      const name = pathologyNames[i];
      const isChronic = faker.datatype.boolean(0.7); // 70% de chance de ser crônica

      pathologies.push({
        name: name,
        icd10: `E${faker.number.int({ min: 10, max: 99 })}.${faker.number.int({ min: 0, max: 9 })}`,
        severity: faker.helpers.arrayElement(['leve', 'moderada', 'grave']),
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

  async down (queryInterface) {
    await queryInterface.bulkDelete('patients', null, {});
    await queryInterface.bulkDelete('doctors', null, {});
    await queryInterface.bulkDelete('pathologies', null, {});
  }
};
