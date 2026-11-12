const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();
console.log("NEW WALLGLOW AUTH CODE LOADED");
// ========================================
// JWT TOKEN
// ========================================

const createToken = (user) => {
    return jwt.sign({
            id: user._id.toString(),
            email: user.email,
        },
        process.env.JWT_SECRET, { expiresIn: "7d" }
    );
};

// ========================================
// PUBLIC USER DATA
// ========================================

const publicUser = (user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    profileImage: user.profileImage || "",
    authProvider: user.authProvider || "local",
});

// ========================================
// FIREBASE ADMIN INITIALIZATION
// ========================================

const initializeFirebase = () => {
    const apps = getApps();

    if (apps.length > 0) {
        return getAuth(apps[0]);
    }

    const serviceAccount = require("../admin.json");

    const app = initializeApp({
        credential: cert(serviceAccount),
    });

    return getAuth(app);
};

// ========================================
// SIGNUP
// ========================================

router.post("/signup", async(req, res) => {
    try {
        const name = req.body.name ?.trim();
        const email = req.body.email ?.trim().toLowerCase();
        const password = req.body.password;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required.",
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                message: "Enter a valid email address.",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters.",
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered. Please login.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            authProvider: "local",
        });

        return res.status(201).json({
            message: "Account created successfully.",
            token: createToken(user),
            user: publicUser(user),
        });
    } catch (error) {
        console.error("Signup error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Email already registered.",
            });
        }

        return res.status(500).json({
            message: "Unable to create account.",
        });
    }
});

// ========================================
// NORMAL LOGIN
// ========================================

router.post("/login", async(req, res) => {
    try {
        const email = req.body.email ?.trim().toLowerCase();
        const password = req.body.password;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required.",
            });
        }

        const user = await User.findOne({ email })
            .select("+password");

        if (!user || !user.password) {
            return res.status(401).json({
                message: "Invalid email or password.",
            });
        }

        const validPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!validPassword) {
            return res.status(401).json({
                message: "Invalid email or password.",
            });
        }

        return res.status(200).json({
            message: "Login successful.",
            token: createToken(user),
            user: publicUser(user),
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Unable to login.",
        });
    }
});

// ========================================
// GOOGLE LOGIN
// ========================================

router.post("/google", async(req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken || typeof idToken !== "string") {
            return res.status(400).json({
                message: "Google ID token is required.",
            });
        }

        // Initialize Firebase
        const firebaseAuth = initializeFirebase();

        // Verify Google ID token
        let decoded;

        try {
            decoded = await firebaseAuth.verifyIdToken(idToken);
        } catch (error) {
            console.error(
                "Firebase verification failed:",
                error.code,
                error.message
            );

            return res.status(401).json({
                message: "Invalid or expired Google token.",
            });
        }

        // Check verified email
        if (!decoded.email || decoded.email_verified !== true) {
            return res.status(401).json({
                message: "Use a verified Google account.",
            });
        }

        const email = decoded.email.trim().toLowerCase();

        // Find existing user
        let user = await User.findOne({
            $or: [
                { googleId: decoded.uid },
                { email },
            ],
        });

        if (user) {
            if (user.googleId && user.googleId !== decoded.uid) {
                return res.status(409).json({
                    message: "Email linked to another Google account.",
                });
            }

            // Do not silently link an existing password account.
            // Require explicit account linking after authentication.
            if (!user.googleId) {
                return res.status(409).json({
                    message: "An account already exists with this email. Log in with your password to link Google.",
                });
            }

            user.name = decoded.name || user.name;
            user.profileImage =
                decoded.picture || user.profileImage;

            await user.save();
        } else {
            user = await User.create({
                name: decoded.name || email.split("@")[0],
                email,
                googleId: decoded.uid,
                profileImage: decoded.picture || "",
                authProvider: "google",
            });
        }

        return res.status(200).json({
            message: "Google login successful.",
            token: createToken(user),
            user: publicUser(user),
        });
    } catch (error) {
        console.error("Google login error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "User account already exists.",
            });
        }

        return res.status(500).json({
            message: "Unable to complete Google login.",
        });
    }
});

// ========================================
// CURRENT USER
// ========================================

router.get("/me", auth, async(req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        return res.status(200).json({
            user: publicUser(user),
        });
    } catch (error) {
        console.error("Current user error:", error);

        return res.status(500).json({
            message: "Unable to fetch profile.",
        });
    }
});

module.exports = router;