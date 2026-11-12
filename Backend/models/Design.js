const mongoose = require("mongoose");

const designSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    title: {
        type: String,
        default: "My Wall Design",
    },
    originalImage: {
        type: String,
        required: true,
    },
    previewImage: {
        type: String,
        required: true,
    },
    primaryColor: {
        type: String,
        default: "#C98F91",
    },
    secondaryColor: {
        type: String,
        default: "#E8DCCB",
    },
    pattern: {
        type: String,
        default: "solid",
    },
    intensity: {
        type: Number,
        default: 65,
    },
    isFavorite: {
        type: Boolean,
        default: false,
        index: true,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
}, { timestamps: true });

module.exports = mongoose.model("Design", designSchema);