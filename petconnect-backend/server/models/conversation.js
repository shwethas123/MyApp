export default (sequelize, DataTypes) => {
  const Conversation = sequelize.define(
    'Conversation',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      adopter_id: { type: DataTypes.INTEGER, allowNull: false },
      shelter_id: { type: DataTypes.INTEGER, allowNull: false },
      pet_id: { type: DataTypes.INTEGER },
      adoption_request_id: { type: DataTypes.INTEGER },
      is_anonymous: { type: DataTypes.BOOLEAN, defaultValue: true },
      status: {
        type: DataTypes.ENUM('Inquiry', 'Applied', 'Closed'),
        defaultValue: 'Inquiry',
      },
      last_message_at: { type: DataTypes.DATE },
      adopter_unread: { type: DataTypes.INTEGER, defaultValue: 0 },
      shelter_unread: { type: DataTypes.INTEGER, defaultValue: 0 },
      deleted_at: { type: DataTypes.DATE },
    },
    {
      tableName: 'conversations',
      underscored: true,
      paranoid: true,
    }
  );

  Conversation.associate = (models) => {
    Conversation.belongsTo(models.User, { foreignKey: 'adopter_id', as: 'adopter' });
    Conversation.belongsTo(models.Shelter, { foreignKey: 'shelter_id', as: 'shelter' });
    Conversation.belongsTo(models.Pet, { foreignKey: 'pet_id', as: 'pet' });
    Conversation.hasMany(models.Message, { foreignKey: 'conversation_id', as: 'messages' });
  };

  return Conversation;
};