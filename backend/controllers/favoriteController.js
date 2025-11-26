// controllers/favoriteController.js

const { pool } = require("../config/db"); // 🔑 Importamos el pool de Postgres (¡NO importamos el modelo Favorite!)

// --- AÑADIR FAVORITO (INSERT) ---
exports.addFavorite = async (req, res) => {
  try {
    const { videoId, title, thumbnail, url } = req.body;
    // El ID del usuario (req.user) ahora es el ID entero (INTEGER) de Postgres

    // 1. Verificar si existe (Postgres: SELECT)
    // Usamos la restricción UNIQUE que pusimos en la tabla: user_id y video_id
    const checkResult = await pool.query(
      "SELECT id FROM favorites WHERE user_id = $1 AND video_id = $2",
      [req.user, videoId]
    );

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ msg: "Este video ya está en favoritos" });
    }

    // 2. Insertar nuevo favorito (Postgres: INSERT)
    // RETURNING id nos devuelve el ID (SERIAL PRIMARY KEY) del nuevo registro
    const insertResult = await pool.query(
      "INSERT INTO favorites (user_id, video_id, title, thumbnail, url) VALUES ($1, $2, $3, $4, $5) RETURNING id, video_id, title, thumbnail, url",
      [req.user, videoId, title, thumbnail, url]
    );

    // Devolvemos el registro insertado (para mantener el formato JSON de respuesta)
    res.json({ msg: "Favorito agregado", fav: insertResult.rows[0] });
  } catch (error) {
    console.error(error);
    // Si hay un error, puede ser un error de BD (ej. violar una restricción)
    res.status(500).json({ msg: "Error en servidor" });
  }
};

// --- OBTENER FAVORITOS (SELECT) ---
exports.getFavorites = async (req, res) => {
  try {
    // 1. Obtener todos los favoritos del usuario (Postgres: SELECT)
    const result = await pool.query(
      // Seleccionamos las columnas tal como las necesita el frontend
      "SELECT id, video_id, title, thumbnail, url FROM favorites WHERE user_id = $1 ORDER BY id DESC",
      [req.user]
    );

    // En Postgres, los resultados están en .rows
    const favs = result.rows;

    res.json(favs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en servidor" });
  }
};

// --- ELIMINAR FAVORITO (DELETE) ---
exports.removeFavorite = async (req, res) => {
  try {
    const { id } = req.params; // ID del favorito a eliminar

    // 1. Eliminar favorito por ID y User ID (Postgres: DELETE)
    // El id es el PRIMARY KEY de la tabla 'favorites'.
    // Aseguramos que solo el propietario (req.user) pueda eliminarlo.
    const result = await pool.query(
      "DELETE FROM favorites WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, req.user]
    );

    // Si no se eliminó ninguna fila, significa que no se encontró o no era del usuario.
    const deletedRows = result.rows.length;

    if (deletedRows === 0) {
      return res.status(404).json({ msg: "Favorito no encontrado" });
    }

    res.json({ msg: "Favorito eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en servidor" });
  }
};

// module.exports = { addFavorite, getFavorites, removeFavorite }; // Asegúrate de exportar
