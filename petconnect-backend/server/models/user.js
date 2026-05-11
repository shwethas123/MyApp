import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.AdoptionApplication, {
        foreignKey: "userId",
        as: "adoptionApplications",
      });
    }
  }

  User.init(
    {
      first_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      phone: {
        type: DataTypes.BIGINT,
        allowNull: true,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      otp: {
        type: DataTypes.STRING(6),
        allowNull: true,
      },
      otp_expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },  

      
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "roles",
          key: "id",
        },
      },
      account_status: {
        type: DataTypes.ENUM("Active", "Pending", "Banned"),
        defaultValue: "Pending",
      },
      email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      location: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      living_situation: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      pet_experience_years: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      preferred_species: {
        type: DataTypes.ENUM("dog", "cat", "both", "birds", "rabbit", "others"),
        allowNull: true,
      },
      profile_completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      profile_photo: {
        type: DataTypes.STRING(500),
        allowNull: true,
        defaultValue: null,
      },
      profile_photo_public_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      reset_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      reset_token_expiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      aadhar_proof_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      rental_agreement_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      aadhar_proof_public_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    rental_agreement_public_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    home_visit_warning_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      google_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    oauth_user: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  User.associate = (models) => {

    User.belongsTo(models.Role, {
      foreignKey: "role_id",
      as: "roleDetails",
    });

    User.hasOne(models.Shelter, {
      foreignKey: "owner_id",
      as: "shelter",
    });

    User.hasMany(models.ShelterFiles, {
      foreignKey: "verified_by",
      as: "verified_files",
    });
  };

  return User;
};
