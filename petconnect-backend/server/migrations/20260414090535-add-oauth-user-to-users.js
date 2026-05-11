export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("users", "oauth_user", {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn("Users", "oauth_user");
}