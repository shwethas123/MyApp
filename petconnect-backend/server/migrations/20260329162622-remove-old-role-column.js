"use strict";

export default {
  async up(queryInterface) {
    await queryInterface.removeColumn("users", "role");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_users_role";'
    );
  },

  async down(queryInterface, Sequelize) {
    console.warn("Cannot auto-reverse this migration safely");
  },
};