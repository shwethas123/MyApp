"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("AdoptionApplications", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      petId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "pets",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      shelterId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "shelter",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      // Auto-fetched from User table
      first_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },

      last_name: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      petExperienceYears: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "Years of past pet experience",
      },
      // User-filled fields
      currentOccupation: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      livingArrangement: {
        type: Sequelize.ENUM("Family", "I live alone", "House/Room mates"),
        allowNull: false,
      },
      familyAgreement: {
        type: Sequelize.ENUM("Yes", "No", "N/A"),
        allowNull: false,
        defaultValue: "N/A",
        comment: "Are all family members happy to adopt a pet?",
      },
      landlordAllowsPets: {
        type: Sequelize.ENUM("Yes", "No", "I am the owner"),
        allowNull: false,
        comment: "If rented house, does landlord allow pets?",
      },
      petCareWhenAway: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: "Who will take care of pet during vacation/work travel?",
      },
      status: {
        type: Sequelize.ENUM(
          "pending",
          "approved",
          "rejected",
          "home_visit",
          "completed",
        ),
        allowNull: false,
        defaultValue: "pending",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("AdoptionApplications");
  },
};
