export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('shelter', 'profile_photo_url', {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: null,
  });
  await queryInterface.addColumn('shelter', 'profile_photo_public_id', {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: null,
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('shelter', 'profile_photo_url');
  await queryInterface.removeColumn('shelter', 'profile_photo_public_id');
}