'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('shelter_government_details', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      shelter_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      department_name: {
        type: Sequelize.STRING
      },
      municipality: {
        type: Sequelize.STRING
      },
      office: {
        type: Sequelize.STRING
      },
      government_id_number: {
        type: Sequelize.STRING
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('shelter_government_details');
  }
};