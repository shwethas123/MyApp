"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "profile_photo", {
      type: Sequelize.STRING(500),
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addColumn("users", "profile_photo_public_id", {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "profile_photo");
    await queryInterface.removeColumn("users", "profile_photo_public_id");
  },
};