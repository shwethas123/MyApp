"use strict";

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex("notifications", {
      fields: ["user_id", { name: "created_at", order: "DESC" }],
      name: "idx_notifications_user_created",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "notifications",
      "idx_notifications_user_created"
    );
  },
};