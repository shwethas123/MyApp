"use strict";

export default {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable("shelter");

    if (!tableDesc.latitude) {
      await queryInterface.addColumn("shelter", "latitude", {
        type: Sequelize.FLOAT,
        allowNull: true,
      });
    }

    if (!tableDesc.longitude) {
      await queryInterface.addColumn("shelter", "longitude", {
        type: Sequelize.FLOAT,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("shelter", "latitude");
    await queryInterface.removeColumn("shelter", "longitude");
  },
};