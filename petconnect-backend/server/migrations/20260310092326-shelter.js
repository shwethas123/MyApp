"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("shelter", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      description: {
        type: Sequelize.TEXT,
      },

      type: {
        type: Sequelize.ENUM("ngo", "government", "rescuer"),
        allowNull: false,
      },

      owner_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      approved_by: {
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      status: {
        type: Sequelize.ENUM("Pending", "Verified", "Rejected", "Inactive"),
        defaultValue: "Pending",
      },

      contact_email: {
        type: Sequelize.STRING,
        unique: true,
      },

      contact_phone: {
        type: Sequelize.BIGINT,
      },

      city: {
        type: Sequelize.STRING,
      },

      state: {
        type: Sequelize.STRING,
      },

      country: {
        type: Sequelize.STRING,
      },

      zipcode: {
        type: Sequelize.INTEGER,
      },

      approved_at: {
        type: Sequelize.DATE,
      },

      deleted_at: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable("shelter");
  },
};
