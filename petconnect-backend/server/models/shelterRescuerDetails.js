export default (sequelize, DataTypes) => {
    const ShelterRescuerDetails = sequelize.define(
        "ShelterRescuerDetails",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            shelter_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                unique: true,
                validate :{
                    isInt : true,
                }
            },
            id_type: {
                type: DataTypes.STRING,
            },
            id_number: {
                type: DataTypes.STRING,
            },
            rescue_story: {
                type: DataTypes.TEXT,
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            },
            updated_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            }
        },
        {
            tableName: "shelter_rescuer_details",
            timestamps: false,
        }
    );
    ShelterRescuerDetails.associate = (models)=>{
    ShelterRescuerDetails.belongsTo(models.Shelter, {
        foreignKey : "shelter_id",
        as : "shelter",
    });
    };
    return ShelterRescuerDetails;
};