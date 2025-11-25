const Favorite = require("../models/Favorite");

exports.addFavorite = async (req, res) => {
  try {
    const { videoId, title, thumbnail, url } = req.body;

    const favoriteExists = await Favorite.findOne({
      user: req.user,
      videoId,
    });

    if (favoriteExists) {
      return res.status(400).json({ msg: "Este video ya está en favoritos" });
    }

    const fav = new Favorite({
      user: req.user,
      videoId,
      title,
      thumbnail,
      url,
    });

    await fav.save();
    res.json({ msg: "Favorito agregado", fav });
  } catch (error) {
    res.status(500).json({ msg: "Error en servidor" });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const favs = await Favorite.find({ user: req.user });
    res.json(favs);
  } catch (error) {
    res.status(500).json({ msg: "Error en servidor" });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Favorite.findOneAndDelete({
      _id: id,
      user: req.user,
    });

    if (!deleted) {
      return res.status(404).json({ msg: "Favorito no encontrado" });
    }

    res.json({ msg: "Favorito eliminado" });
  } catch (error) {
    res.status(500).json({ msg: "Error en servidor" });
  }
};
