"use strict";

export default {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable("users");

    if (!tableDesc.aadhar_proof_url) {
      await queryInterface.addColumn("users", "aadhar_proof_url", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      });
    }

    if (!tableDesc.rental_agreement_url) {
      await queryInterface.addColumn("users", "rental_agreement_url", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "aadhar_proof_url");
    await queryInterface.removeColumn("users", "rental_agreement_url");
  },
};