"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("reports", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      conversation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "conversations", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      reporter_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      reported_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      reason: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      details: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("pending", "reviewed", "resolved", "dismissed"),
        defaultValue: "pending",
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

  async down(queryInterface) {
    await queryInterface.dropTable("reports");
  },
};