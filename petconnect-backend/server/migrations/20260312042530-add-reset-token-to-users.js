"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "reset_token", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn("users", "reset_token_expiry", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "reset_token");
    await queryInterface.removeColumn("users", "reset_token_expiry");
  },
};
