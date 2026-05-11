export default (sequelize, DataTypes) => {
  const AdoptionRequest = sequelize.define(
    "AdoptionRequest",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      pet_id: { type: DataTypes.INTEGER, allowNull: false },
      adopter_id: { type: DataTypes.INTEGER, allowNull: false },
      shelter_id: { type: DataTypes.INTEGER, allowNull: false },
      living_condition: { type: DataTypes.STRING },
      current_occupation: { type: DataTypes.STRING },
      address: { type: DataTypes.STRING },
      pet_allowed_in_rented: { type: DataTypes.BOOLEAN },
      housing_type: { type: DataTypes.STRING },
      pet_allowed_in_apartment: { type: DataTypes.BOOLEAN },
      pet_supervision_plan: { type: DataTypes.TEXT },
      working_hours: { type: DataTypes.STRING },
      past_experience: { type: DataTypes.TEXT },
      interview_scheduled_at: { type: DataTypes.DATE },
      home_visit_scheduled_at: { type: DataTypes.DATE },
      status: {
        type: DataTypes.ENUM(
          "Pending",
          "Interviewing",
          "HomeVisit",
          "Approved",
          "Rejected",
          "Withdrawn",
        ),
        defaultValue: "Pending",
      },
      reviewed_by: { type: DataTypes.INTEGER },
      reviewed_at: { type: DataTypes.DATE },
      approved_at: { type: DataTypes.DATE },
      rejected_at: { type: DataTypes.DATE },
      deleted_at: { type: DataTypes.DATE },
    },
    {
      tableName: "adoption_requests",
      underscored: true,
      paranoid: true,
    },
  );

  AdoptionRequest.associate = (models) => {
    AdoptionRequest.belongsTo(models.Pet, { foreignKey: "pet_id", as: "pet" });
    AdoptionRequest.belongsTo(models.User, {
      foreignKey: "adopter_id",
      as: "adopter",
    });
    AdoptionRequest.belongsTo(models.Shelter, {
      foreignKey: "shelter_id",
      as: "shelter",
    });
  };

  return AdoptionRequest;
};
