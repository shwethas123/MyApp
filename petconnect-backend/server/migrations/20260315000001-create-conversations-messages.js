export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('conversations', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    adopter_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    shelter_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'shelter', key: 'id' },
      onDelete: 'CASCADE',
    },
    pet_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'pets', key: 'id' },
      onDelete: 'SET NULL',
    },
    adoption_request_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'adoption_requests', key: 'id' },
      onDelete: 'SET NULL',
    },
    is_anonymous: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    status: {
      type: Sequelize.ENUM('Inquiry', 'Applied', 'Closed'),
      defaultValue: 'Inquiry',
    },
    last_message_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    adopter_unread: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    shelter_unread: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    deleted_at: { type: Sequelize.DATE, allowNull: true },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
  });

  await queryInterface.createTable('messages', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    conversation_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'conversations', key: 'id' },
      onDelete: 'CASCADE',
    },
    sender_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    file_url: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    file_type: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    is_read: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    deleted_at: { type: Sequelize.DATE, allowNull: true },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('messages');
  await queryInterface.dropTable('conversations');
}
