'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('user_profiles');

    if (!table.cpf) {
      await queryInterface.addColumn('user_profiles', 'cpf', {
        type: Sequelize.STRING(20),
        allowNull: true,
      });
    }

    if (!table.rg) {
      await queryInterface.addColumn('user_profiles', 'rg', {
        type: Sequelize.STRING(20),
        allowNull: true,
      });
    }

    if (!table.cpf_document_url) {
      await queryInterface.addColumn('user_profiles', 'cpf_document_url', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!table.rg_document_url) {
      await queryInterface.addColumn('user_profiles', 'rg_document_url', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface) => {
    const table = await queryInterface.describeTable('user_profiles');

    if (table.rg_document_url) {
      await queryInterface.removeColumn('user_profiles', 'rg_document_url');
    }

    if (table.cpf_document_url) {
      await queryInterface.removeColumn('user_profiles', 'cpf_document_url');
    }

    if (table.rg) {
      await queryInterface.removeColumn('user_profiles', 'rg');
    }

    if (table.cpf) {
      await queryInterface.removeColumn('user_profiles', 'cpf');
    }
  },
};
