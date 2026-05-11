export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("wishlists", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    pet_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "pets", key: "id" },
      onDelete: "CASCADE",
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("NOW()"),
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("NOW()"),
    },
  });

  // WHY: DB-level unique constraint is safer than app-level check.
  // Even if two requests hit simultaneously, DB rejects the duplicate.
  await queryInterface.addIndex("wishlists", ["user_id", "pet_id"], {
    unique: true,
    name: "wishlists_user_pet_unique",
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("wishlists");
}