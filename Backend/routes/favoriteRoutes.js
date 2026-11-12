const express = require("express");
const router = express.Router();

const {
    addFavoriteShade,
    getFavoriteShades
} = require("../controllers/favoriteController");

const authMiddleware = require("../middleware/authMiddleware");

// POST: Save favorite shade
router.post("/", authMiddleware, addFavoriteShade);

// GET: Get favorite shades
router.get("/", authMiddleware, getFavoriteShades);

module.exports = router;