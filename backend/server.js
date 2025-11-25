// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

// Conectar BD
connectDB();

// Rutas
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/favorites", require("./routes/favoriteRoutes"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
