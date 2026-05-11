export default (sequelize, DataTypes) => {
  const OtpStore = sequelize.define(
    "OtpStore",
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      otp: {
        type: DataTypes.STRING(6),
        allowNull: false,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "otp_store",
      underscored: true,
    },
  );

  return OtpStore;
};
