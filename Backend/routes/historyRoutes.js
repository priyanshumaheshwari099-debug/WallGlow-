const express = require("express");

const DesignActivity = require("../models/DesignActivity");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

// GET /api/history
router.get("/", async(req, res) => {
    try {
        const userId = req.user.id || req.user._id;

        const limit = Math.min(
            Math.max(Number(req.query.limit) || 50, 1),
            100
        );

        const history = await DesignActivity.find({
                user: userId,
            })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate(
                "design",
                "title previewImage primaryColor pattern isFavorite"
            )
            .lean();

        return res.json({
            count: history.length,
            history,
        });
    } catch (error) {
        console.error("History error:", error);

        return res.status(500).json({
            message: "Could not load history.",
        });
    }
});

module.exports = router;