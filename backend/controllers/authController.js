// controllers/auth.controller.js
const { pool } = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const nodemailer = require("nodemailer"); // Para envío de correos
const crypto = require("crypto"); // Para generación de tokens

const GOOGLE_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL;

// =======================================================
// A. FUNCIONES AUXILIARES (reCAPTCHA y Correo)
// =======================================================

// --- reCAPTCHA: Función para verificar el token ---
async function verifyRecaptcha(token) {
  if (!GOOGLE_SECRET_KEY) {
    console.error("RECAPTCHA_SECRET_KEY no está definido en el entorno.");
    return false;
  }

  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: GOOGLE_SECRET_KEY,
          response: token,
        },
      }
    );
    return response.data.success;
  } catch (error) {
    console.error("Error al verificar reCAPTCHA con Google:", error);
    return false;
  }
}

// --- Correo: Función para enviar correo electrónico ---
const sendEmail = async (options) => {
  const VERIFIED_EMAIL = "quintinowork0@gmail.com";

  const transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false, // Opcional: puedes probar con true y puerto 465 si falla
    auth: {
      user: process.env.EMAIL_USER, // 'apikey'
      pass: process.env.EMAIL_PASS, // La API Key
    },
  });

  const mailOptions = {
    from: `Tu Aplicación <${VERIFIED_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  await transporter.sendMail(mailOptions);
};

// =======================================================
// B. CONTROLADORES PRINCIPALES
// =======================================================

// 1. CONTROLADOR DE REGISTRO
exports.register = async (req, res) => {
  // ... (código reCAPTCHA)

  try {
    const { firstName, lastName, username, email, password, recaptcha } =
      req.body;

    // 1. Verificar si existe (Postgres)
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ msg: "El correo ya está registrado" });
    }

    // 2. Insertar nuevo usuario (Postgres)
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (first_name, last_name, username, email, password) VALUES ($1, $2, $3, $4, $5)",
      [firstName, lastName, username, email, hashedPassword]
    );

    res.json({ msg: "Usuario registrado correctamente" });
  } catch (error) {
    // ...
  }
};

// 2. CONTROLADOR DE LOGIN
exports.login = async (req, res) => {
  try {
    const { emailOrUser, password } = req.body;

    // 1. Buscar usuario por email O username (Postgres)
    const result = await pool.query(
      "SELECT id, username, email, password FROM users WHERE email = $1 OR username = $1",
      [emailOrUser]
    );

    const user = result.rows[0];

    if (!user) return res.status(400).json({ msg: "Usuario no encontrado" });

    //Comparación de contraseña
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ msg: "Contraseña incorrecta" });

    // 2. Firmar token (usa user.id, no user._id)
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    // ...
  }
};

// 3. CONTROLADOR DE OLVIDO DE CONTRASEÑA
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // 1. Buscar usuario por email (Postgres)
    const result = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      // SEGURIDAD: Respuesta genérica
      return res.json({
        msg: "Si el correo existe, se ha enviado un enlace de restablecimiento.",
      });
    }

    // 2. Generar y guardar el token HASHED y su expiración
    const resetToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Expiración: 1 hora a partir de ahora, formateado como ISO string para Postgres
    const expireTime = new Date(Date.now() + 3600000).toISOString();

    // Actualizar la base de datos (Postgres: UPDATE)
    await pool.query(
      "UPDATE users SET reset_password_token = $1, reset_password_expire = $2 WHERE id = $3",
      [hashedToken, expireTime, user.id] // Usamos user.id para identificar la fila
    );

    // 3. Crear el enlace de restablecimiento (usando el token NO HASHED)
    const resetURL = `${FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `
        <h1>Has solicitado un restablecimiento de contraseña</h1>
        <p>Por favor, haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <p><a href="${resetURL}" target="_blank">${resetURL}</a></p>  
        <p>Este enlace expirará en 1 hora.</p>
    `;

    try {
      // 4. Enviar el correo
      await sendEmail({
        email: email, // Usamos el email directo
        subject: "Restablecimiento de Contraseña",
        message,
      });

      res.json({
        msg: "Si el correo existe, se ha enviado un enlace de restablecimiento.",
      });
    } catch (err) {
      // Manejo de error de envío de correo (limpiar tokens en DB)
      await pool.query(
        "UPDATE users SET reset_password_token = NULL, reset_password_expire = NULL WHERE id = $1",
        [user.id]
      );

      console.error("Error de envío de correo:", err);
      return res.status(500).json({
        msg: "Error al enviar el correo. Verifica tu configuración de EMAIL_PASS.",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// 4. CONTROLADOR DE RESTABLECIMIENTO FINAL
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    // 1. Hashear el token recibido para buscarlo en la DB
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // 2. Buscar usuario por token y verificar que NO haya expirado (Postgres)
    // Usamos el operador > en SQL para verificar que la fecha de expiración sea mayor que la fecha/hora actual (NOW())
    const result = await pool.query(
      "SELECT id FROM users WHERE reset_password_token = $1 AND reset_password_expire > NOW()",
      [resetPasswordToken]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({
        msg: "El enlace es inválido o ha expirado. Por favor, solicita un nuevo restablecimiento.",
      });
    }

    // 3. Hashear y actualizar la contraseña (Postgres)
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Limpiar los tokens e actualizar la contraseña en una sola query
    await pool.query(
      "UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expire = NULL WHERE id = $2",
      [hashedPassword, user.id]
    );

    res.json({
      msg: "Contraseña restablecida con éxito. Ya puedes iniciar sesión.",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ msg: "Error en el servidor al restablecer la contraseña." });
  }
};
