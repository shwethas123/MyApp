export default (sequelize, DataTypes) => {
  const Shelter = sequelize.define(
    "Shelter",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      description: DataTypes.TEXT,

      type: {
        type: DataTypes.ENUM("ngo", "government", "rescuer"),
        allowNull: false,
      },

      owner_id: {
        type: DataTypes.INTEGER,
        validate: {
          isInt: true,
        },
        allowNull: true,
      },
      latitude: {
  type: DataTypes.FLOAT,
  allowNull: true,
},
longitude: {
  type: DataTypes.FLOAT,
  allowNull: true,
},

      rejection_reason: {        // ── FIXED: removed duplicate
        type: DataTypes.TEXT,
        allowNull: true,
      },

      approved_by: DataTypes.INTEGER,

      status: {
        type: DataTypes.ENUM("Pending", "Verified", "Rejected", "Inactive"),
        defaultValue: "Pending",
      },

      contact_email: {
        type: DataTypes.STRING,
        unique: true,
      },

      contact_phone: DataTypes.STRING,
      upi_id: {
      type: DataTypes.STRING,
      allowNull: true,
      },

      city:    DataTypes.STRING,
      state:   DataTypes.STRING,
      country: DataTypes.STRING,
      zipcode: DataTypes.INTEGER,

      approved_at: DataTypes.DATE,
      deleted_at:  DataTypes.DATE,

      upi_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // ── NEW: profile photo ───────────────────────────────────────────────
      profile_photo_url: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },

      profile_photo_public_id: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: "shelter",
      underscored: true,
    },
  );

  Shelter.associate = (models) => {
    Shelter.belongsTo(models.User, {
      foreignKey: "owner_id",
      as: "owner",
    });

    Shelter.belongsTo(models.User, {
      foreignKey: "approved_by",
      as: "approvedAdmin",
    });

    Shelter.hasOne(models.ShelterNgoDetails, {
      foreignKey: "shelter_id",
      as: "ngo_details",
    });

    Shelter.hasMany(models.Pet, {
      foreignKey: "shelter_id",
      as: "pets",
    });

    Shelter.hasMany(models.ShelterFiles, {
      foreignKey: "shelter_id",
      as: "files",
    });

    Shelter.hasOne(models.Government, {
      foreignKey: "shelter_id",
      as: "government_details",
    });

    Shelter.hasMany(models.AdoptionApplication, {
      foreignKey: "shelterId",
      as: "adoptionApplications",
    });

    Shelter.hasOne(models.ShelterRescuerDetails, {
      foreignKey: "shelter_id",
      as: "rescuer_details",
    });
  };

  return Shelter;
};
