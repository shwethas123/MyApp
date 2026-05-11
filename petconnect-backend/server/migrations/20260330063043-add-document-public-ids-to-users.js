'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'aadhar_proof_public_id', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addColumn('users', 'rental_agreement_public_id', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'aadhar_proof_public_id');
    await queryInterface.removeColumn('users', 'rental_agreement_public_id');
  },
};