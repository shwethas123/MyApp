"use strict";

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("pets", "prerequisites", {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: [],
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("pets", "prerequisites");
  },
};