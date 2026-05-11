// In the generated migration file:
export default {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.addColumn("users", "google_id", {
      type: DataTypes.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("users", "password", {
      type: DataTypes.STRING,
      allowNull: true,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn("users", "google_id");
  },
};