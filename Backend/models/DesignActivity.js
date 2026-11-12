const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    design: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Design",
        default: null,
    },
    action: {
        type: String,
        enum: [
            "design_saved",
            "design_deleted",
            "favorite_added",
            "favorite_removed",
            "design_updated",
        ],
        required: true,
    },
    title: {
        type: String,
        default: "Wall design",
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
}, { timestamps: true });

module.exports = mongoose.model("DesignActivity", activitySchema);