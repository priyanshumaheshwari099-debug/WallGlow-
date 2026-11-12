const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ?
        authHeader.slice(7).trim() :
        "";

    if (!token) {
        return res.status(401).json({
            message: "Please log in first.",
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userId =
            decoded.id ||
            decoded._id ||
            decoded.userId ||
            decoded.sub;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({
                message: "Invalid login token.",
            });
        }

        req.user = {
            ...decoded,
            id: userId,
            _id: userId,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Session expired. Please log in again.",
        });
    }
}

module.exports = authMiddleware;