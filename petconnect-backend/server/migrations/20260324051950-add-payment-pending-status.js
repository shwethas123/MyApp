// migration file
'use strict';
export  default{
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_AdoptionApplications_status" ADD VALUE IF NOT EXISTS 'payment_pending';`
    );
  },
  async down(queryInterface, Sequelize) {
    // ENUM values cannot be removed in PostgreSQL without recreating the type
    console.log('Cannot remove enum value in PostgreSQL');
  }
};