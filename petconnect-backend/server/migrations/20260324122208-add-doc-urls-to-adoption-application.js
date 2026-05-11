"use strict";

/**
 * Migration: add aadhar_proof_url and rental_agreement_url to Users table.
 *
 * Rename this file to a real timestamp before running, e.g.:
 *   20250324120000-add-doc-urls-to-users.js
 *
 * Then run:
 *   npx sequelize-cli db:migrate
 */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("AdoptionApplications", "aadhar_proof_url", {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addColumn("AdoptionApplications", "rental_agreement_url", {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("AdoptionApplications", "aadhar_proof_url");
    await queryInterface.removeColumn("AdoptionApplications", "rental_agreement_url");
  },
};