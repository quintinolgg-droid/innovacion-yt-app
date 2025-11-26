// middlewares/auth.js

const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "No hay token, permiso no válido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔑 NOTA IMPORTANTE: req.user = decoded.id; ahora es un INTEGER de Postgres.
    // Mientras no intentes usar funciones de Mongoose/Mongo en este ID, estará bien.
    // ¡Tu código ya está usando req.user de forma correcta en los controladores!
    req.user = decoded.id;

    next();
  } catch (error) {
    res.status(400).json({ msg: "Token no válido" });
  }
};
