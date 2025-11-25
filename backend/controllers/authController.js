const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;

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
