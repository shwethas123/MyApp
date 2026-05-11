export default (sequelize, DataTypes) => {
  const Report = sequelize.define(
    'Report',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      conversation_id: { type: DataTypes.INTEGER, allowNull: false },
      reporter_id: { type: DataTypes.INTEGER, allowNull: false },
      reported_user_id: { type: DataTypes.INTEGER, allowNull: false },
      reason: { type: DataTypes.STRING, allowNull: false },
      details: { type: DataTypes.TEXT, allowNull: true },
      status: {
        type: DataTypes.ENUM('pending', 'reviewed', 'resolved', 'dismissed'),
        defaultValue: 'pending',
      },
      resolution_note: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    },
    {
      tableName: 'reports',
      underscored: true,
    }
  );

  Report.associate = (models) => {
    Report.belongsTo(models.User, { as: 'reporter', foreignKey: 'reporter_id' });
    Report.belongsTo(models.User, { as: 'reportedUser', foreignKey: 'reported_user_id' });
    Report.belongsTo(models.Conversation, { foreignKey: 'conversation_id' });
  };

  return Report;
};