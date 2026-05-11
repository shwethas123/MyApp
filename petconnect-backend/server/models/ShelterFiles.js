"use strict";

export default (sequelize, DataTypes) => {
  const ShelterFiles = sequelize.define(
    "ShelterFiles",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      shelter_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      file_url: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      public_id: {
        type: DataTypes.STRING,
      },

      file_type: {
        type: DataTypes.ENUM(
          "registration_certificate",
          "government_authorization",
          "id_proof",
          "additional_document",
        ),
        allowNull: false,
      },

      verification_status: {
        type: DataTypes.ENUM("Pending", "Approved", "Rejected"),
        defaultValue: "Pending",
      },

      verified_by: {
        type: DataTypes.INTEGER,
      },

      rejection_reason: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "shelter_files",
      underscored: true,
    },
  );

  /* ASSOCIATIONS */

  ShelterFiles.associate = (models) => {
    ShelterFiles.belongsTo(models.Shelter, {
      foreignKey: "shelter_id",
      as: "shelter",
    });

    ShelterFiles.belongsTo(models.User, {
      foreignKey: "verified_by",
      as: "verified_admin",
    });
  };

  return ShelterFiles;
};
