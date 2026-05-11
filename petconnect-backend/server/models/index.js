import Sequelize from "sequelize";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = {};
const required = ["DB_USERNAME", "DB_PASSWORD", "DB_NAME", "DB_HOST"];
for (const key of required) {
  if (!process.env[key]) {
    console.error(` Missing required env variable: ${key}`);
    process.exit(1);
  }
}
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"), 
    dialect: process.env.DB_DIALECT || "postgres",
   // logging: (msg) => console.log(" SQL:", msg), //  See every query — remove in production   
    pool: {
      max: 10,        // max connections in pool
      min: 0,         // min connections in pool
      acquire: 30000, // max ms to wait for connection before throwing error
      idle: 10000,    // ms before idle connection is released
    },

    dialectOptions: {
      
      statement_timeout: 10000,
      
      lock_timeout: 5000,
    },
  }
);


const modelFiles = fs
  .readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf(".") !== 0 &&
      file !== path.basename(__filename) &&
      file.slice(-3) === ".js" &&
      !file.endsWith(".test.js"),
  );

for (const file of modelFiles) {
  console.log("Loading model:", file);
  const modelModule = await import(path.join(__dirname, file));
  const model = modelModule.default(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
}
for (const modelName of Object.keys(db)) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;