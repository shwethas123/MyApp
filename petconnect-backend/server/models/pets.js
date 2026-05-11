import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Pet extends Model {
    static associate(models) {
      // Shelter relation
      Pet.belongsTo(models.Shelter, {
        foreignKey: "shelter_id",
        as: "shelter",
      });

      // Created by user
      Pet.belongsTo(models.User, {
        foreignKey: "created_by",
        as: "creator",
      });

      // Updated by user
      Pet.belongsTo(models.User, {
        foreignKey: "updated_by",
        as: "updater",
      });
      Pet.hasMany(models.AdoptionApplication, {
        foreignKey: "petId",
        as: "adoptionApplications",
      });
      Pet.hasMany(models.PetImage, { foreignKey: "pet_id", as: "images" });
    }
  }

  Pet.init(
    {
      name: DataTypes.STRING,

      species: DataTypes.STRING,

      breed: DataTypes.STRING,

      age: DataTypes.INTEGER,

      gender: DataTypes.STRING,

      prerequisites: {
  type: DataTypes.JSONB,
  allowNull: true,
  defaultValue: [],
},

      vaccinated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      sterilized: {
        type: DataTypes.ENUM("not_sterilized", "neutered", "spayed"),
      },

      special_needs: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      health_status: DataTypes.TEXT,
      health_record_url: DataTypes.STRING(500),
      vaccination_record_url: DataTypes.STRING(500),
      sterilization_certificate_url: DataTypes.STRING(500),
      vaccination_notes: DataTypes.TEXT,

      temperament: DataTypes.TEXT,

      rescue_story: DataTypes.TEXT,

      adoption_fee: DataTypes.INTEGER,

      status: {
        type: DataTypes.ENUM("Available", "Reserved", "Adopted", "OnHold"),
        defaultValue: "Available",
      },

      good_with_kids: DataTypes.BOOLEAN,

      shelter_id: DataTypes.INTEGER,

      listed_at: DataTypes.DATE,

      adopted_at: DataTypes.DATE,

      deleted_at: DataTypes.DATE,

      created_by: DataTypes.INTEGER,

      updated_by: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Pet",
      tableName: "pets",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
        indexes: [
      { name: "idx_pets_shelter_id",       fields: ["shelter_id"] },
      { name: "idx_pets_deleted_at",        fields: ["deleted_at"] },
      { name: "idx_pets_status",            fields: ["status"] },
      { name: "idx_pets_listed_at",         fields: ["listed_at"] },
      { name: "idx_pets_species",           fields: ["species"] },
      { name: "idx_pets_gender",            fields: ["gender"] },
      { name: "idx_pets_age",               fields: ["age"] },
      { name: "idx_pets_browse_composite",  fields: ["status", "deleted_at", "listed_at"] },
      { name: "idx_pets_shelter_active",    fields: ["shelter_id", "deleted_at"] },
    ],
    },
  );

  return Pet;
};
