'use strict';

const { faker } = require('@faker-js/faker/locale/pt_BR');
const bcryptjs = require('bcryptjs');

async function hashPassword(password) {
  return bcryptjs.hash(password, 10);
}

module.exports = {
  async up(queryInterface, Sequelize) {
    // Prune existing users
    await queryInterface.bulkDelete('users', null, {});

    const specialties = [
      'Cardiologia', 'Dermatologia', 'Endocrinologia', 'Gastroenterologia',
      'Neurologia', 'Ortopedia', 'Pediatria', 'Psiquiatria', 'Radiologia',
      'Fisioterapia', 'Enfermagem', 'Fonoaudiologia', 'Nutrição', 'Psicologia'
    ];

    const councilTypes = ['CRM', 'COREN', 'CREFITO', 'CRF', 'CREFONO', 'CFN', 'CRP'];
    const clinicNames = [
      'Clínica Vida Saudável', 'Centro Médico Esperança', 'Hospital São José',
      'Clínica Bem-Estar', 'Instituto de Saúde Integral', 'Hospital Regional',
      'Clínica 24 Horas', 'Centro de Reabilitação Vida', 'Hospital Universitário',
      'Clínica de Especialidades Dr. Silva'
    ];

    const adminPassword = await hashPassword('admin@123456');
    const professionalPassword = await hashPassword('prof@123456');
    const careLocationPassword = await hashPassword('clinic@123456');
    const responsiblePassword = await hashPassword('resp@123456');

    const users = [];

    // 1. CREATE ADMIN USERS
    users.push({
      email: 'admin@takingcare.com',
      password_hash: adminPassword,
      user_type: 'admin',
      is_active: true,
      admin: true,
      profile: {
        display_name: 'Admin Principal',
        phone: faker.phone.number('+55 ## 9#### ####'),
        avatar_url: faker.image.avatar(),
        address: `${faker.location.streetAddress()}, ${faker.location.city()} - ${faker.location.state()}`,
      },
      created_at: new Date(),
      updated_at: new Date(),
    });

    for (let i = 1; i <= 2; i++) {
      users.push({
        email: `admin${i}@takingcare.com`,
        password_hash: adminPassword,
        user_type: 'admin',
        is_active: true,
        admin: true,
        profile: {
          display_name: `Admin ${i}`,
          phone: faker.phone.number('+55 ## 9#### ####'),
          avatar_url: faker.image.avatar(),
          address: `${faker.location.streetAddress()}, ${faker.location.city()} - ${faker.location.state()}`,
        },
        created_at: faker.date.past({ years: 1 }),
        updated_at: faker.date.recent({ days: 30 }),
      });
    }

    // 2. CREATE PROFESSIONAL USERS
    for (let i = 0; i < 15; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const specialty = faker.helpers.arrayElement(specialties);

      users.push({
        email: `prof${i + 1}@takingcare.com`,
        password_hash: professionalPassword,
        user_type: 'professional',
        is_active: faker.datatype.boolean(0.9),
        admin: false,
        profile: {
          display_name: `Prof. ${firstName} ${lastName}`,
          phone: faker.phone.number('+55 ## 9#### ####'),
          avatar_url: faker.image.avatar(),
          address: `${faker.location.streetAddress()}, ${faker.location.city()} - ${faker.location.state()}`,
          type: 'professional',
          council_type: faker.helpers.arrayElement(councilTypes),
          council_number: faker.string.numeric({ length: 6 }),
          specialty: specialty,
          sub_specialties: faker.helpers.arrayElements(specialties, { min: 0, max: 2 }),
          bio: faker.lorem.paragraph(),
          years_experience: faker.number.int({ min: 1, max: 40 }),
          languages: faker.helpers.arrayElements(['Português', 'Inglês', 'Espanhol'], { min: 1, max: 3 }),
          education: {
            school: faker.helpers.arrayElement(['USP', 'UNIFESP', 'UFMG', 'UFRJ', 'UFBA', 'UFC', 'UFPR']),
            graduation_year: faker.number.int({ min: 1980, max: 2020 }),
          },
          availability: {
            days: faker.helpers.arrayElements(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], {
              min: 3,
              max: 5,
            }),
            hours: {
              start: faker.number.int({ min: 7, max: 12 }),
              end: faker.number.int({ min: 15, max: 20 }),
            },
          },
        },
        created_at: faker.date.past({ years: 2 }),
        updated_at: faker.date.recent({ days: 60 }),
      });
    }

    // Add one more professional with fixed email
    users.push({
      email: 'doctor@example.com',
      password_hash: professionalPassword,
      user_type: 'professional',
      is_active: true,
      admin: false,
      profile: {
        display_name: 'Dr. Example',
        phone: faker.phone.number('+55 ## 9#### ####'),
        avatar_url: faker.image.avatar(),
        address: `${faker.location.streetAddress()}, ${faker.location.city()} - ${faker.location.state()}`,
        type: 'professional',
        council_type: 'CRM',
        council_number: faker.string.numeric({ length: 6 }),
        specialty: faker.helpers.arrayElement(specialties),
        sub_specialties: faker.helpers.arrayElements(specialties, { min: 1, max: 3 }),
        bio: faker.lorem.paragraph(),
        years_experience: faker.number.int({ min: 1, max: 40 }),
        languages: ['Português', 'Inglês'],
      },
      created_at: faker.date.past({ years: 2 }),
      updated_at: faker.date.recent({ days: 60 }),
    });

    // 3. CREATE CARE LOCATION USERS
    const selectedClinicNames = faker.helpers.arrayElements(clinicNames, { min: 8, max: 8 });
    for (let i = 0; i < 8; i++) {
      const isClinic = i % 2 === 0;
      const type = isClinic ? 'clinic' : 'hospital';
      const name = selectedClinicNames[i];

      users.push({
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@takingcare.com`,
        password_hash: careLocationPassword,
        user_type: type,
        is_active: faker.datatype.boolean(0.95),
        admin: false,
        profile: {
          display_name: name,
          phone: faker.phone.number('+55 ## 3### ####'),
          avatar_url: faker.image.avatar(),
          address: `${faker.location.streetAddress()}, ${faker.location.city()} - ${faker.location.state()}`,
          type: 'care_location',
          cnpj: faker.string.numeric(14).replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5'),
          specialties: faker.helpers.arrayElements(specialties, { min: 2, max: 5 }),
          beds: type === 'hospital' ? faker.number.int({ min: 20, max: 500 }) : null,
          opening_hours: {
            monday_to_friday: '08:00 - 18:00',
            saturday: '08:00 - 12:00',
            sunday: 'Fechado',
          },
          has_emergency: type === 'hospital',
          payment_methods: faker.helpers.arrayElements(
            ['Cartão de Crédito', 'Cartão de Débito', 'Convênio', 'Particular'],
            { min: 2, max: 4 }
          ),
        },
        created_at: faker.date.past({ years: 3 }),
        updated_at: faker.date.recent({ days: 90 }),
      });
    }

    // 4. CREATE RESPONSIBLE USERS
    for (let i = 0; i < 20; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      users.push({
        email: `resp${i + 1}@takingcare.com`,
        password_hash: responsiblePassword,
        user_type: 'user',
        is_active: faker.datatype.boolean(0.95),
        admin: false,
        profile: {
          display_name: `${firstName} ${lastName}`,
          phone: faker.phone.number('+55 ## 9#### ####'),
          avatar_url: faker.image.avatar(),
          address: `${faker.location.streetAddress()}, ${faker.location.city()} - ${faker.location.state()}`,
          type: 'responsible',
          occupation: faker.person.jobTitle(),
          availability: faker.helpers.arrayElement(['weekdays', 'weekends', '24/7']),
        },
        created_at: faker.date.past({ years: 2 }),
        updated_at: faker.date.recent({ days: 60 }),
      });
    }

    // Convert profile JSONB objects to strings for bulkInsert compatibility
    const usersForInsert = users.map(user => ({
      ...user,
      profile: user.profile ? JSON.stringify(user.profile) : null,
    }));

    // Insert all users at once
    await queryInterface.bulkInsert('users', usersForInsert);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
