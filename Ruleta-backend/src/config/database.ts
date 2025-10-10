import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const {
  DB_DIALECT,
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASS
} = process.env;

if (!DB_NAME || !DB_USER) {
  throw new Error("❌ Faltan variables de entorno para la conexión a la base de datos");
}

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: Number(DB_PORT),
  dialect: DB_DIALECT as any,
  logging: process.env.NODE_ENV === "development" ? console.log : false,
});

export async function initDb() {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión a la base de datos establecida correctamente");
    
    // Importar las asociaciones
    await import('@src/models/associations');
    
    // Solo recrear en desarrollo
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ force: false });
      console.log("✅ Base de datos recreada correctamente (modo desarrollo)");
    } else {
      await sequelize.sync();
      console.log("✅ Base de datos sincronizada correctamente");
    }
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error);
    process.exit(1);
  }
}