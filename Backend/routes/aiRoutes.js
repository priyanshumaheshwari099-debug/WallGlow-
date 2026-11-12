const express = require("express");
const multer = require("multer");

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(
                new Error("Only JPG, PNG and WEBP images are allowed")
            );
        }

        cb(null, true);
    }
});

router.post(
    "/redesign",
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "mask", maxCount: 1 }
    ]),
    async(req, res) => {
        try {
            const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
            const apiToken = process.env.CLOUDFLARE_API_TOKEN;

            if (!accountId || !apiToken) {
                return res.status(500).json({
                    message: "Cloudflare credentials are missing in backend .env"
                });
            }

            const imageFile = req.files ?.image ?.[0];
            const maskFile = req.files ?.mask ?.[0];
            const mode = req.body.mode || "wall";

            if (!imageFile) {
                return res.status(400).json({
                    message: "Please upload a room photo."
                });
            }

            if (!maskFile) {
                return res.status(400).json({
                    message: "Wall mask is missing. Please select a wall first."
                });
            }

            if (!["wall", "room"].includes(mode)) {
                return res.status(400).json({
                    message: "Invalid redesign mode."
                });
            }

            const endpoint =
                `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/runwayml/stable-diffusion-v1-5-inpainting`;

            const prompt = mode === "room" ?
                [
                    "Create a photorealistic interior room makeover.",
                    "Use an elegant burgundy and warm cream colour scheme.",
                    "Create a stylish, harmonious and modern interior.",
                    "Preserve the room's basic architecture and camera perspective.",
                    "Keep the result realistic with natural lighting and believable textures.",
                    "Do not add text, labels or watermarks."
                ].join(" ") :
                [
                    "Photorealistic interior wall repainting.",
                    "Change only the area selected by the white mask.",
                    "Use an elegant burgundy and warm cream paint design.",
                    "Preserve all unmasked areas, furniture, windows, doors and flooring.",
                    "Keep the original room layout and camera perspective.",
                    "Use realistic paint texture and natural lighting.",
                    "Do not add text, labels or watermarks."
                ].join(" ");

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    prompt,
                    image: [
                        ...new Uint8Array(imageFile.buffer)
                    ],
                    mask: [
                        ...new Uint8Array(maskFile.buffer)
                    ],
                    strength: mode === "room" ? 0.75 : 0.45,
                    guidance: 7.5,
                    num_steps: 20
                })
            });

            if (!response.ok) {
                const details = await response.text();

                console.error(
                    "Cloudflare AI error:",
                    response.status,
                    details
                );

                return res.status(response.status).json({
                    message: `Cloudflare AI request failed (${response.status}).`,
                    details: details.slice(0, 1000)
                });
            }

            const contentType =
                response.headers.get("content-type") || "";

            let imageBuffer;

            if (contentType.includes("application/json")) {
                const result = await response.json();

                if (
                    result.success === false ||
                    (result.errors && result.errors.length > 0)
                ) {
                    return res.status(502).json({
                        message: result.errors ?.[0] ?.message ||
                            "AI image generation failed."
                    });
                }

                const imageData =
                    result.result ?.image ||
                    result.result ?.image_b64;

                if (typeof imageData === "string") {
                    const cleanBase64 = imageData.replace(
                        /^data:image\/\w+;base64,/,
                        ""
                    );

                    imageBuffer = Buffer.from(
                        cleanBase64,
                        "base64"
                    );
                } else if (Array.isArray(imageData)) {
                    imageBuffer = Buffer.from(imageData);
                } else {
                    return res.status(502).json({
                        message: "Cloudflare returned an unexpected image format."
                    });
                }
            } else {
                imageBuffer = Buffer.from(
                    await response.arrayBuffer()
                );
            }

            if (!imageBuffer || imageBuffer.length === 0) {
                return res.status(502).json({
                    message: "AI returned an empty image."
                });
            }

            return res.json({
                success: true,
                image: `data:image/png;base64,${imageBuffer.toString("base64")}`
            });
        } catch (error) {
            console.error("AI redesign error:", error);

            return res.status(500).json({
                message: error.message ||
                    "Unable to redesign the room."
            });
        }
    }
);

module.exports = router;