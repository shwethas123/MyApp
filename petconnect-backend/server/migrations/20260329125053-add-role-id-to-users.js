"use strict";

export default {
  async up(queryInterface, Sequelize) {
    // Step 1: Add role_id column (nullable first, so existing rows don't break)
    await queryInterface.addColumn("users", "role_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "roles",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // Step 2: Migrate existing ENUM role values → role_id
    await queryInterface.sequelize.query(`
      UPDATE users
      SET role_id = roles.id
      FROM roles
      WHERE users.role::text = roles.name
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "role_id");
  },
};