// controllers/auth.controller.js

const User = require("../models/User");
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
    // 🔑 CAMBIO CLAVE: Usar la dirección verificada aquí
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
  try {
    const { firstName, lastName, username, email, password, recaptcha } =
      req.body;

    // 1. Verificación reCAPTCHA
    if (!recaptcha) {
      return res.status(400).json({ msg: "Falta la verificación reCAPTCHA." });
    }
    const isHuman = await verifyRecaptcha(recaptcha);
    if (!isHuman) {
      return res.status(400).json({
        msg: "Verificación reCAPTCHA fallida. Por favor, inténtalo de nuevo.",
      });
    }

    // 2. Lógica de registro
    let user = await User.findOne({ email });
    if (user)
      return res.status(400).json({ msg: "El correo ya está registrado" });

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.json({ msg: "Usuario registrado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// 2. CONTROLADOR DE LOGIN
exports.login = async (req, res) => {
  try {
    const { emailOrUser, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrUser }, { username: emailOrUser }],
    });

    if (!user) return res.status(400).json({ msg: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Contraseña incorrecta" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// 3. CONTROLADOR DE OLVIDO DE CONTRASEÑA
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // SEGURIDAD: Respuesta genérica para no revelar si el correo existe
      return res.json({
        msg: "Si el correo existe, se ha enviado un enlace de restablecimiento.",
      });
    }

    // 1. Generar y guardar el token HASHED y su expiración
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 3600000; // Expira en 1 hora
    await user.save();

    // 2. Crear el enlace de restablecimiento (usando el token NO HASHED)
    const resetURL = `${FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `
        <h1>Has solicitado un restablecimiento de contraseña</h1>
        <p>Por favor, haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <p><a href="${resetURL}" target="_blank">${resetURL}</a></p>  
        <p>Este enlace expirará en 1 hora.</p>
    `;

    try {
      // 3. Enviar el correo
      await sendEmail({
        email: user.email,
        subject: "Restablecimiento de Contraseña",
        message,
      });

      res.json({
        msg: "Si el correo existe, se ha enviado un enlace de restablecimiento.",
      });
    } catch (err) {
      // Manejo de error de envío de correo
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

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

    // 2. Buscar usuario por token y verificar que NO haya expirado
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        msg: "El enlace es inválido o ha expirado. Por favor, solicita un nuevo restablecimiento.",
      });
    }

    // 3. Hashear y actualizar la contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // 4. Limpiar los tokens para invalidar el enlace
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

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
