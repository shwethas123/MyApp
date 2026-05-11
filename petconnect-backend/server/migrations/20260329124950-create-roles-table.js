"use strict";

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("roles", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
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

    // Insert default roles immediately after creating the table
    await queryInterface.bulkInsert("roles", [
      { name: "admin",   created_at: new Date(), updated_at: new Date() },
      { name: "shelter", created_at: new Date(), updated_at: new Date() },
      { name: "adopter", created_at: new Date(), updated_at: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("roles");
  },
};