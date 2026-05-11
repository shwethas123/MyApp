"use strict";

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("AdoptionApplications", "rejection_reason", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("AdoptionApplications", "rejection_reason");
  },
};