"use strict";

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("pets", {
      id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      name: Sequelize.STRING,

      species: {
        type: Sequelize.STRING,
        comment: "dog|cat",
      },

      breed: Sequelize.STRING,

      age: Sequelize.INTEGER,

      gender: {
        type: Sequelize.STRING,
        comment: "male|female",
      },

      vaccinated: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      sterilized: {
        type: Sequelize.ENUM("not_sterilized", "neutered", "spayed"),
      },

      special_needs: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      health_status: Sequelize.TEXT,
      temperament: Sequelize.TEXT,
      rescue_story: Sequelize.TEXT,

      adoption_fee: Sequelize.INTEGER,

      status: {
        type: Sequelize.ENUM("Available", "Reserved", "Adopted", "OnHold"),
        defaultValue: "Available",
      },

      good_with_kids: Sequelize.BOOLEAN,

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

      listed_at: Sequelize.DATE,
      adopted_at: Sequelize.DATE,
      deleted_at: Sequelize.DATE,

      created_by: {
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      updated_by: {
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("pets");
  },
};
