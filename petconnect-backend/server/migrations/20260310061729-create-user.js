"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      first_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },

      last_name: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },

      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },

      phone: {
        type: Sequelize.INTEGER,
        allowNull: true,
        unique: true,
      },

      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      role: {
        type: Sequelize.ENUM("adopter", "admin", "shelter"),
        allowNull: false,
        defaultValue: "adopter",
      },

      account_status: {
        type: Sequelize.ENUM("Active", "Pending", "Banned"),
        allowNull: false,
        defaultValue: "Pending",
      },

      email_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      location: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      living_situation: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },

      pet_experience_years: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 0,
        },
      },

      preferred_species: {
        type: Sequelize.ENUM("dog", "cat", "birds","rabbit","others"),
        allowNull: true,
      },

      profile_completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("users");
  },
};
