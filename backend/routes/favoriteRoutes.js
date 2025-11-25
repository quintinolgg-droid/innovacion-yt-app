const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const {
  addFavorite,
  getFavorites,
  removeFavorite,
} = require("../controllers/favoriteController");

router.post("/add", auth, addFavorite);
router.get("/list", auth, getFavorites);
router.delete("/remove/:id", auth, removeFavorite);

module.exports = router;
