import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class AdoptionApplication extends Model {
    static associate(models) {
      AdoptionApplication.belongsTo(models.User, {
        foreignKey: "userId",
        as: "applicant",
      });
      AdoptionApplication.belongsTo(models.Pet, {
        foreignKey: "petId",
        as: "pet",
      });
      AdoptionApplication.belongsTo(models.Shelter, {
        foreignKey: "shelterId",
        as: "shelter",
      });
    }
  }

  AdoptionApplication.init(
    {
      userId: { type: DataTypes.INTEGER, allowNull: false },
      petId: { type: DataTypes.INTEGER, allowNull: false },
      shelterId: { type: DataTypes.INTEGER, allowNull: false },
      first_name: { type: DataTypes.STRING(50), allowNull: false },
      last_name: { type: DataTypes.STRING(50), allowNull: true },
      phoneNumber: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false },
      petExperienceYears: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      currentOccupation: { type: DataTypes.STRING, allowNull: false },
      address: { type: DataTypes.TEXT, allowNull: false },
      livingArrangement: {
        type: DataTypes.ENUM("Family", "I live alone", "House/Room mates"),
        allowNull: false,
      },
      familyAgreement: {
        type: DataTypes.ENUM("Yes", "No", "N/A"),
        allowNull: false,
        defaultValue: "N/A",
      },
      landlordAllowsPets: {
        type: DataTypes.ENUM("Yes", "No", "I am the owner"),
        allowNull: false,
      },
      petCareWhenAway: { type: DataTypes.TEXT, allowNull: false },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "approved",
          "rejected",
          "home_visit",
          "payment_pending",
          "completed",
          "dissolved",
        ),
        allowNull: false,
        defaultValue: "pending",
      },
      rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      home_visit_photos: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      documents_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      payment_method: {
        type: DataTypes.ENUM("upi", "cash"),
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
      home_visit_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      home_visit_time_slot: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      // ── Home Visit Attempt Tracking ──────────────────────────────────
      home_visit_attempt: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      home_visit_status: {
        type: DataTypes.ENUM("pending", "passed", "failed"),
        allowNull: true,
        defaultValue: null,
      },
      home_visit_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      home_visit_warning_sent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "AdoptionApplication",
      tableName: "AdoptionApplications",
    },
  );

  return AdoptionApplication;
};
