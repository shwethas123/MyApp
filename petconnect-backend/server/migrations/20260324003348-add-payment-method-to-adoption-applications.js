'use strict';

export default{
  async up(queryInterface, Sequelize) {
    // Add payment_method column
    await queryInterface.addColumn('AdoptionApplications', 'payment_method', {
      type: Sequelize.ENUM('upi', 'cash'),
      allowNull: true,
      after: 'rejection_reason', // places it after rejection_reason column (MySQL only)
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove payment_method column
    await queryInterface.removeColumn('AdoptionApplications', 'payment_method');
    
    // Also drop the ENUM type (required for PostgreSQL)
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_AdoptionApplications_payment_method";'
    );
  },
};