import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Role extends Model {}

  Role.init(
    {
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "Role",
      tableName: "roles",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Role.associate = (models) => {
    Role.hasMany(models.User, {
      foreignKey: "role_id",
      as: "users",
    });
  };

  return Role;
};