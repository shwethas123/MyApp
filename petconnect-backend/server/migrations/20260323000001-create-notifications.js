"use strict";

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("notifications", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      reference_type: {
        type: Sequelize.ENUM(
          "message",
          "adoption",
          "shelter",
          "report",
          "user"
        ),
        allowNull: true,
      },
      reference_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("notifications");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_notifications_reference_type";'
    );
  },
};
