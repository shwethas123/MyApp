"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("shelter_rescuer_details", {
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

      id_type: {
        type: Sequelize.STRING,
      },

      id_number: {
        type: Sequelize.STRING,
      },

      rescue_story: {
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
    await queryInterface.dropTable("shelter_rescuer_details");
  },
};