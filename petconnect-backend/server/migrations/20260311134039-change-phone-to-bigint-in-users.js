"use strict";

/** @type {import('sequelize-cli').Migration} */

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("users", "phone", {
      type: Sequelize.BIGINT,
      allowNull: true,
      unique: true,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("users", "phone", {
      type: Sequelize.INTEGER,
      allowNull: true,
      unique: true,
    });
  },
};
