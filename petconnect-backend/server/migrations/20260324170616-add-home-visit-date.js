export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "AdoptionApplications",
      "home_visit_date",
      {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("AdoptionApplications", "home_visit_date");
  },
};