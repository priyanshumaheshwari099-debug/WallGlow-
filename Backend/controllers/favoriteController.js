const Design = require("../models/Design");

// POST: Add Favorite Shade
const addFavoriteShade = async(req, res) => {
    try {
        const {
            title,
            originalImage,
            previewImage,
            primaryColor,
            secondaryColor,
            pattern,
            colorName
        } = req.body;

        if (!originalImage || !previewImage || !primaryColor) {
            return res.status(400).json({
                success: false,
                message: "Shade information is missing"
            });
        }

        // Check whether shade is already in favorites
        const existingFavorite = await Design.findOne({
            user: req.user.id,
            isFavorite: true,
            primaryColor,
            "metadata.type": "color-shade",
            "metadata.colorName": colorName
        });

        if (existingFavorite) {
            return res.status(200).json({
                success: true,
                message: "Shade is already in favorites",
                favorite: existingFavorite
            });
        }

        // Save favorite shade in MongoDB
        const favorite = await Design.create({
            user: req.user.id,
            title: title || `Favorite Shade - ${colorName}`,
            originalImage,
            previewImage,
            primaryColor,
            secondaryColor: secondaryColor || primaryColor,
            pattern: pattern || "solid",
            isFavorite: true,
            metadata: {
                type: "color-shade",
                colorName: colorName || "Favorite Shade"
            }
        });

        return res.status(201).json({
            success: true,
            message: "Favorite shade saved successfully",
            favorite
        });

    } catch (error) {
        console.error("Add Favorite Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// GET: Fetch Favorite Shades
const getFavoriteShades = async(req, res) => {
    try {
        const favorites = await Design.find({
            user: req.user.id,
            isFavorite: true,
            "metadata.type": "color-shade"
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: favorites.length,
            favorites
        });

    } catch (error) {
        console.error("Get Favorites Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    addFavoriteShade,
    getFavoriteShades
};