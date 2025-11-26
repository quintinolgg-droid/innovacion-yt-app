const { pool } = require("../config/db");

// --- AÑADIR FAVORITO (INSERT) ---
exports.addFavorite = async (req, res) => {
  try {
    const { videoId, title, thumbnail, url } = req.body;

    const checkResult = await pool.query(
      "SELECT id FROM favorites WHERE user_id = $1 AND video_id = $2",
      [req.user, videoId]
    );

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ msg: "Este video ya está en favoritos" });
    }

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
      "SELECT id, video_id AS videoid, title, thumbnail, url FROM favorites  WHERE favorite = 1 AND user_id = $1 ORDER BY id DESC",
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

// --- OBTENER TODOS LSO VIDEOS (SELECT) ---
exports.getVideos = async (req, res) => {
  try {
    // 1. Obtener todos los favoritos del usuario (Postgres: SELECT)
    const result = await pool.query(
      // Seleccionamos las columnas tal como las necesita el frontend
      "SELECT id, video_id AS videoid, title, thumbnail, url FROM favorites WHERE favorite = 0"
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

// --- MARCAR COMO FAVORITO (UPDATE: favorite = 1) ---
exports.markAsFavorite = async (req, res) => {
  try {
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({ msg: "Se requiere el videoId" });
    }

    // 1. Actualizar el estado 'favorite' a 1.
    // Usamos RETURNING * para obtener el registro actualizado.
    const result = await pool.query(
      "UPDATE favorites SET favorite = 1 WHERE user_id = $1 AND video_id = $2 RETURNING *",
      [req.user, videoId]
    );

    const updatedRow = result.rows.length;

    if (updatedRow === 0) {
      // Si no se encontró el video, puede que no haya sido agregado por el usuario previamente.
      return res.status(404).json({
        msg: "Video no encontrado en tu lista para marcar como favorito",
      });
    }

    res.json({ msg: "Video marcado como favorito", fav: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en servidor" });
  }
};

// --- DESMARCAR COMO FAVORITO (UPDATE: favorite = 1) ---
exports.unmarkAsFavorite = async (req, res) => {
  try {
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({ msg: "Se requiere el videoId" });
    }

    // 1. Actualizar el estado 'favorite' a 1.
    // Usamos RETURNING * para obtener el registro actualizado.
    const result = await pool.query(
      "UPDATE favorites SET favorite = 0 WHERE user_id = $1 AND video_id = $2 RETURNING *",
      [req.user, videoId]
    );

    const updatedRow = result.rows.length;

    if (updatedRow === 0) {
      // Si no se encontró el video, puede que no haya sido agregado por el usuario previamente.
      return res
        .status(404)
        .json({ msg: "Video no encontrado en tu lista para desmarcar" });
    }

    res.json({ msg: "Video marcado como favorito", fav: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en servidor" });
  }
};
