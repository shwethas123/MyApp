"use strict";

export default (sequelize, DataTypes) => {
  const ShelterNgoDetails = sequelize.define(
    "ShelterNgoDetails",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      shelter_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        validate: {
          isInt: true,
        },
      },

      registration_type: {
        type: DataTypes.ENUM("society", "trust", "section8"),
        allowNull: false,
        validate: {
          isIn: [["society", "trust", "section8"]],
        },
      },

      registration_number: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },

      year_of_registration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
          min: 1900,
          max: new Date().getFullYear(),
        },
      },
    },
    {
      tableName: "shelter_ngo_details",
      underscored: true,
    },
  );

  ShelterNgoDetails.associate = (models) => {
    ShelterNgoDetails.belongsTo(models.Shelter, {
      foreignKey: "shelter_id",
      as: "shelter",
    });
  };

  return ShelterNgoDetails;
};
