const express = require("express");
const mongoose = require("mongoose");

const Design = require("../models/Design");
const DesignActivity = require("../models/DesignActivity");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All routes require login
router.use(authMiddleware);

// Get logged-in user ID
const getUserId = (req) => {
    return req.user ?.id || req.user ?._id;
};

// Validate image
function isValidImage(value) {
    return (
        typeof value === "string" &&
        (
            value.startsWith("data:image/") ||
            /^https?:\/\//i.test(value)
        )
    );
}

// Validate MongoDB ID
function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

// ======================================
// POST /api/designs
// Save new design or favorite shade
// ======================================

router.post("/", async(req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                message: "User authentication required.",
            });
        }

        const {
            title,
            originalImage,
            previewImage,
            image,
            primaryColor,
            secondaryColor,
            pattern,
            intensity,
            metadata,
            isFavorite,
        } = req.body;

        const finalPreview = previewImage || image;

        if (!isValidImage(finalPreview)) {
            return res.status(400).json({
                message: "Valid preview image is required.",
            });
        }

        const design = await Design.create({
            user: userId,

            title: title || "My Wall Design",

            originalImage: isValidImage(originalImage) ?
                originalImage :
                finalPreview,

            previewImage: finalPreview,

            primaryColor: primaryColor || "#C98F91",

            secondaryColor: secondaryColor || primaryColor || "#C98F91",

            pattern: pattern || "solid",

            intensity: Math.max(
                0,
                Math.min(100, Number(intensity) || 65)
            ),

            isFavorite: isFavorite === true,

            metadata: metadata && typeof metadata === "object" ?
                metadata :
                {},
        });

        await DesignActivity.create({
            user: userId,
            design: design._id,
            action: "design_saved",
            title: design.title,
        });

        return res.status(201).json({
            success: true,
            message: "Design saved successfully.",
            design,
        });

    } catch (error) {
        console.error("SAVE DESIGN ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Could not save design.",
            error: error.message,
        });
    }
});

// ======================================
// GET /api/designs
// Get all logged-in user's designs
// ======================================

// GET /api/designs?favorites=true
// Get only favorite designs

router.get("/", async(req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                message: "User authentication required.",
            });
        }

        const filter = {
            user: userId,
        };

        if (req.query.favorites === "true") {
            filter.isFavorite = true;
        }

        const designs = await Design.find(filter)
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: designs.length,
            designs,
        });

    } catch (error) {
        console.error("GET DESIGNS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Could not load designs.",
            error: error.message,
        });
    }
});

// ======================================
// PATCH /api/designs/:id/favorite
// Add or remove favorite
// ======================================

router.patch("/:id/favorite", async(req, res) => {
    try {
        const userId = getUserId(req);
        const { id } = req.params;
        const { isFavorite } = req.body;

        if (!isValidId(id)) {
            return res.status(400).json({
                message: "Invalid design ID.",
            });
        }

        if (typeof isFavorite !== "boolean") {
            return res.status(400).json({
                message: "isFavorite must be true or false.",
            });
        }

        const design = await Design.findOne({
            _id: id,
            user: userId,
        });

        if (!design) {
            return res.status(404).json({
                message: "Design not found.",
            });
        }

        design.isFavorite = isFavorite;

        await design.save();

        await DesignActivity.create({
            user: userId,
            design: design._id,
            action: isFavorite ?
                "favorite_added" :
                "favorite_removed",
            title: design.title,
        });

        return res.status(200).json({
            success: true,
            message: isFavorite ?
                "Added to favorites." :
                "Removed from favorites.",
            design,
        });

    } catch (error) {
        console.error("UPDATE FAVORITE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Could not update favorite.",
            error: error.message,
        });
    }
});

// ======================================
// DELETE /api/designs/:id
// Permanently delete design
// ======================================

router.delete("/:id", async(req, res) => {
    try {
        const userId = getUserId(req);
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                message: "Invalid design ID.",
            });
        }

        const design = await Design.findOneAndDelete({
            _id: id,
            user: userId,
        });

        if (!design) {
            return res.status(404).json({
                message: "Design not found.",
            });
        }

        await DesignActivity.create({
            user: userId,
            design: null,
            action: "design_deleted",
            title: design.title,
            details: {
                deletedDesignId: String(design._id),
            },
        });

        return res.status(200).json({
            success: true,
            message: "Design deleted successfully.",
            id: String(design._id),
        });

    } catch (error) {
        console.error("DELETE DESIGN ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Could not delete design.",
            error: error.message,
        });
    }
});

module.exports = router;