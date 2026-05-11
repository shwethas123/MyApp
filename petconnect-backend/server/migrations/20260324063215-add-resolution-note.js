"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("reports", "resolution_note", {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("reports", "resolution_note");
  },
};