// models/petImage.js
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class PetImage extends Model {
    static associate(models) {
      PetImage.belongsTo(models.Pet, {
        foreignKey: "pet_id",
        as: "pet",
      });
    }
  }

  PetImage.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      pet_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      file_url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      public_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      display_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "PetImage",
      tableName: "pet_images",
      timestamps: false,
    }
  );

  return PetImage;
};