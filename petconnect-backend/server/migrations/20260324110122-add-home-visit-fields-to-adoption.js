export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "AdoptionApplications",
      "home_visit_photos",
      {
        type: Sequelize.JSON,
        allowNull: true,
      },
    );
    await queryInterface.addColumn(
      "AdoptionApplications",
      "documents_verified",
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    );
  },
  async down(queryInterface) {
    await queryInterface.removeColumn(
      "AdoptionApplications",
      "home_visit_photos",
    );
    await queryInterface.removeColumn(
      "AdoptionApplications",
      "documents_verified",
    );
  },
};
