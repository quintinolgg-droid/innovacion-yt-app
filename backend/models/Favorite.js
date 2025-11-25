const mongoose = require("mongoose");

const FavoriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  videoId: { type: String, required: true },
  title: { type: String, required: true },
  thumbnail: { type: String, required: true },
  url: { type: String, required: true },
});

module.exports = mongoose.model("Favorite", FavoriteSchema);
