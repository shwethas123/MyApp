export default (sequelize, DataTypes) => {
  const Government = sequelize.define(
    "Government",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      shelter_id: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        unique : true,
        validate : {
          isInt : true,
        }
      },
      department_name: {
        type: DataTypes.STRING
      },
      municipality: {
        type: DataTypes.STRING
      },
      office: {
        type: DataTypes.STRING
      },
      government_id_number: {
        type: DataTypes.STRING
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
      tableName: "shelter_government_details",
      timestamps: false
    }
  );
  Government.associate=(models)=>{
    Government.belongsTo(models.Shelter,{
      foreignKey:"shelter_id",
      as : "shelter",
    });
    
  };

  return Government;
};