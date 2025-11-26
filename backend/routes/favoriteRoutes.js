const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const {
  addFavorite,
  getFavorites,
  removeFavorite,
  getVideos,
  markAsFavorite,
  unmarkAsFavorite,
} = require("../controllers/favoriteController");

router.post("/add", auth, addFavorite);
router.get("/list", auth, getFavorites);
router.get("/listall", auth, getVideos);

router.put("/mark", auth, markAsFavorite);
router.put("/unmark", auth, unmarkAsFavorite);

router.delete("/remove/:id", auth, removeFavorite);

module.exports = router;
