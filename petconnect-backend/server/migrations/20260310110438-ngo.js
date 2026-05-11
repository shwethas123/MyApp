"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("shelter_ngo_details", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      shelter_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "shelter",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      registration_type: {
        type: Sequelize.ENUM("society", "trust", "section8"),
        allowNull: false,
      },

      registration_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      year_of_registration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("shelter_ngo_details");
  },
};
