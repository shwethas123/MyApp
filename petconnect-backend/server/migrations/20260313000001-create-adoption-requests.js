export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("adoption_requests", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    pet_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "pets", key: "id" },
      onDelete: "CASCADE",
    },
    adopter_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    shelter_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "shelter", key: "id" },
      onDelete: "CASCADE",
    },
    living_condition: { type: Sequelize.STRING, allowNull: true },
    current_occupation: { type: Sequelize.STRING, allowNull: true },
    address: { type: Sequelize.STRING, allowNull: true },
    pet_allowed_in_rented: { type: Sequelize.BOOLEAN, allowNull: true },
    housing_type: { type: Sequelize.STRING, allowNull: true },
    pet_allowed_in_apartment: { type: Sequelize.BOOLEAN, allowNull: true },
    pet_supervision_plan: { type: Sequelize.TEXT, allowNull: true },
    working_hours: { type: Sequelize.STRING, allowNull: true },
    past_experience: { type: Sequelize.TEXT, allowNull: true },
    interview_scheduled_at: { type: Sequelize.DATE, allowNull: true },
    home_visit_scheduled_at: { type: Sequelize.DATE, allowNull: true },
    status: {
      type: Sequelize.ENUM(
        "Pending",
        "Interviewing",
        "HomeVisit",
        "Approved",
        "Rejected",
        "Withdrawn",
      ),
      allowNull: false,
      defaultValue: "Pending",
    },
    reviewed_by: { type: Sequelize.INTEGER, allowNull: true },
    reviewed_at: { type: Sequelize.DATE, allowNull: true },
    approved_at: { type: Sequelize.DATE, allowNull: true },
    rejected_at: { type: Sequelize.DATE, allowNull: true },
    deleted_at: { type: Sequelize.DATE, allowNull: true },
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

  await queryInterface.addIndex("adoption_requests", ["pet_id", "adopter_id"], {
    unique: true,
    name: "unique_pet_adopter",
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("adoption_requests");
}
