// models/Blacklist.js
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Blacklist = sequelize.define(
    "Blacklist",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      flagged_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "blacklist",
      timestamps: true,
      underscored: true,
    }
  );

  Blacklist.associate = (models) => {
    Blacklist.belongsTo(models.User, { foreignKey: "user_id",   as: "user"      });
    Blacklist.belongsTo(models.User, { foreignKey: "flagged_by", as: "flaggedBy" });
  };

  return Blacklist;
};