"use strict";

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("pets", "health_record_url", {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
    await queryInterface.addColumn("pets", "vaccination_record_url", {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("pets", "health_record_url");
    await queryInterface.removeColumn("pets", "vaccination_record_url");
  },
};  