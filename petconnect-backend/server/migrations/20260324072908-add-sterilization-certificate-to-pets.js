export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("pets", "sterilization_certificate_url", {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("pets", "sterilization_certificate_url");
  },
};
