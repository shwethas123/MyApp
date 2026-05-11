import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Wishlist extends Model {
    static associate(models) {
      Wishlist.belongsTo(models.User, { foreignKey: "user_id" });
      Wishlist.belongsTo(models.Pet, { foreignKey: "pet_id", as: "pet" });
    }
  }

  Wishlist.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      pet_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: "Wishlist",
      tableName: "wishlists",
      underscored: true, // consistent with your project standard
    }
  );

  return Wishlist;
};