"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("shelter_files", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      shelter_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "shelter",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      file_url: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      public_id: {
        type: Sequelize.STRING,
      },

      file_type: {
        type: Sequelize.ENUM(
          "registration_certificate",
          "government_authorization",
          "id_proof",
          "additional_document",
        ),
        allowNull: false,
      },

      verification_status: {
        type: Sequelize.ENUM("Pending", "Approved", "Rejected"),
        defaultValue: "Pending",
      },

      verified_by: {
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      rejection_reason: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable("shelter_files");
  },
};
