"use strict";

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("shelter", "rejection_reason", {
      type: Sequelize.TEXT,
      allowNull: true, // only filled when status = Rejected
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("shelter", "rejection_reason");
  },
};
