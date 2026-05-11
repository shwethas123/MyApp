export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("pets", "vaccination_notes", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("pets", "vaccination_notes");
  },
};