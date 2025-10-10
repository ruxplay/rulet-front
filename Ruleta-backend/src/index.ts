import dotenv from 'dotenv';
dotenv.config();
import { initDb } from './config/database';
import { app } from './server';

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await initDb();
    console.log('✅ Conexión a la base de datos exitosa.');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

start();
