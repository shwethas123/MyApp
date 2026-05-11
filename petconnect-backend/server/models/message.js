export default (sequelize, DataTypes) => {
  const Message = sequelize.define(
    'Message',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      conversation_id: { type: DataTypes.INTEGER, allowNull: false },
      sender_id: { type: DataTypes.INTEGER, allowNull: false },
      content: { type: DataTypes.TEXT },
      file_url: { type: DataTypes.STRING },
      file_type: { type: DataTypes.STRING },
      is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
      deleted_at: { type: DataTypes.DATE },
    },
    {
      tableName: 'messages',
      underscored: true,
      paranoid: true,
    }
  );

  Message.associate = (models) => {
    Message.belongsTo(models.Conversation, { foreignKey: 'conversation_id', as: 'conversation' });
    Message.belongsTo(models.User, { foreignKey: 'sender_id', as: 'sender' });
  };

  return Message;
};
