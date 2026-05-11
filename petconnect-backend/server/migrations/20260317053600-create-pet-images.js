"use strict";

/** @type {import('sequelize-cli').Migration} */

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("pet_images", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    pet_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "pets", key: "id" },
      onDelete: "CASCADE",
    },
    file_url: {
      type: Sequelize.TEXT,   // full cloudinary https:// URL
      allowNull: false,
    },
    public_id: {
      type: Sequelize.STRING, // cloudinary public_id — needed to delete/rename
      allowNull: false,
    },
    display_order: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("pet_images");
}