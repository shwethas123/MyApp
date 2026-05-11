import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Notification extends Model {}

  Notification.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reference_type: {
        type: DataTypes.ENUM(
          "message",
          "adoption",
          "shelter",
          "report",
          "user"
        ),
        allowNull: true,
      },
      reference_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Notification",
      tableName: "notifications",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      indexes: [
        {
          name: "idx_notifications_user_created",
          fields: ["user_id", { name: "created_at", order: "DESC" }],
        },
      ],
    }
  );

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return Notification;
};