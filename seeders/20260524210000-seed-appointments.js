'use strict';

const { faker } = require('@faker-js/faker/locale/pt_BR');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Prune existing appointments
    await queryInterface.bulkDelete('appointments', null, {});

    const specialties = [
      'Cardiology',
      'General Medicine',
      'Pediatrics',
      'Dermatology',
      'Neurology',
    ];

    const statuses = ['draft', 'doing', 'completed', 'canceled'];

    // Get all users to use as userId
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users ORDER BY id ASC'
    );
    const userIds = users[0].map(u => u.id);

    // Get responsible and patient users (not admin, professional, or care location)
    const responsibleUsers = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE user_type = 'user' ORDER BY id ASC"
    );
    const responsibleUserIds = responsibleUsers[0].map(u => u.id);

    // Get professional users
    const professionals = await queryInterface.sequelize.query(
      "SELECT email, profile FROM users WHERE user_type = 'professional' ORDER BY id ASC LIMIT 15"
    );
    const professionalEmails = professionals[0].map(p => p.email);

    // Get care locations
    const careLocations = await queryInterface.sequelize.query(
      "SELECT email, profile FROM users WHERE user_type IN ('clinic', 'hospital') ORDER BY id ASC"
    );
    const careLocationNames = careLocations[0].map(c => {
      const profile = typeof c.profile === 'string' ? JSON.parse(c.profile) : c.profile;
      return profile?.display_name || c.email.split('@')[0];
    });

    const appointments = [];

    // Create 20 appointments spread across responsible users
    for (let i = 0; i < 20; i++) {
      const userId = responsibleUserIds[i % responsibleUserIds.length];
      const professional = faker.helpers.arrayElement(professionalEmails);
      const location = faker.helpers.arrayElement(careLocationNames);
      const specialty = faker.helpers.arrayElement(specialties);
      const status = faker.helpers.arrayElement(statuses);

      // Generate dates mostly in the future, some in the past
      const baseDate = faker.date.between({ from: new Date('2026-01-01'), to: new Date('2026-12-31') });
      const dateString = baseDate.toISOString().split('T')[0];

      const hour = faker.number.int({ min: 8, max: 18 });
      const minute = faker.helpers.arrayElement([0, 15, 30, 45]);
      const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

      appointments.push({
        user_id: userId,
        location,
        professional,
        specialty,
        date: dateString,
        time: timeString,
        duration: 30,
        status,
        notes: status === 'completed' ? faker.lorem.sentence() : null,
        prescription: status === 'completed' ? faker.lorem.paragraph() : null,
        exam_request: status === 'doing' || status === 'completed' ? faker.lorem.sentence() : null,
        next_appointment: status === 'completed' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
        created_at: faker.date.past({ years: 1 }),
        updated_at: faker.date.recent({ days: 30 }),
      });
    }

    await queryInterface.bulkInsert('appointments', appointments);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('appointments', null, {});
  }
};
