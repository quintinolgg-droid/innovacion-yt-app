// config/db.js (¡Actualizado para PostgreSQL!)

const { Pool } = require("pg");

const pool = new Pool({
  // Utiliza la variable de entorno que contiene la URL de Neon
  connectionString: process.env.DATABASE_URL,
  // Neon requiere SSL (sslmode=require ya está en la URL, pero es bueno ser explícito)
  ssl: {
    rejectUnauthorized: false, // Puedes requerir esto si tienes problemas de conexión SSL
  },
});

const connectDB = async () => {
  try {
    // Intenta conectar y obtener una conexión de prueba
    await pool.query("SELECT 1");
    console.log("PostgreSQL conectado con éxito a Neon.");
  } catch (err) {
    console.error("Error al conectar a PostgreSQL:", err.message);
    // Salir del proceso si la conexión falla
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  // Exportamos el Pool para poder ejecutar queries en los Controllers
  pool,
};
