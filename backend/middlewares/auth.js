const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res
      .status(401)
      .json({ msg: "No hay encabezado de autorización, permiso no válido" });
  }

  // El encabezado viene como "Bearer <token>"
  // Dividimos por el espacio (' ') y tomamos la segunda parte [1]
  const tokenParts = authHeader.split(" ");

  // Validamos que el formato sea 'Bearer token'
  if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
    // En caso de que se envíe la cabecera pero con un formato incorrecto
    return res
      .status(401)
      .json({ msg: "Formato de token no válido, se espera 'Bearer <token>'" });
  }

  const token = tokenParts[1]; // Este es el token puro

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adjuntar el ID de usuario decodificado a la solicitud
    req.user = decoded.id;

    next();
  } catch (error) {
    // Esto captura errores como token expirado o firma inválida
    res.status(401).json({ msg: "Token no válido o expirado" });
  }
};
