"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Step 1: Convert to plain VARCHAR so we can drop the old ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE users
        ALTER COLUMN preferred_species TYPE VARCHAR(20);
    `);

    // Step 2: Drop the old ENUM type (whatever values it currently has)
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_users_preferred_species";
    `);

    // Step 3: Create new ENUM — using "birds" and "others" to match
    //         your existing create-user.js migration spelling
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_users_preferred_species"
        AS ENUM ('dog', 'cat', 'both', 'birds', 'rabbit', 'others');
    `);

    // Step 4: Cast the column back to the new ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE users
        ALTER COLUMN preferred_species
          TYPE "enum_users_preferred_species"
          USING preferred_species::"enum_users_preferred_species";
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE users
        ALTER COLUMN preferred_species TYPE VARCHAR(20);
    `);
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_users_preferred_species";
    `);
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_users_preferred_species"
        AS ENUM ('dog', 'cat', 'both');
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE users
        ALTER COLUMN preferred_species
          TYPE "enum_users_preferred_species"
          USING preferred_species::"enum_users_preferred_species";
    `);
  },
};