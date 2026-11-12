
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { saveDesign } from "../../designApi";
import ImageCropEditor from "../../components/ImageCropEditor/ImageCropEditor";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import ImageOwnership from "../../components/ImageOwnership/ImageOwnership";
import "./PaintStudio.css";

const API_URL = "https://wallglow-backend.onrender.com/api/ai/redesign";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const palettes = [
  { name: "Soft & Calm", colors: ["#E8DCCB", "#B7C4B0", "#C9B8D8", "#D8B6A0", "#F1E6D3"] },
  { name: "Modern Luxury", colors: ["#762F46", "#B08A67", "#4A4844", "#D8C5A9", "#8B6A72"] },
  { name: "Earthy Living", colors: ["#A66B50", "#B5AA89", "#687B60", "#E3D4BC", "#826B58"] },
  { name: "Pastel Dreams", colors: ["#E9BFC8", "#C6D5E0", "#D5C8E9", "#F2E2A7", "#BFD9C7"] },
  { name: "Royal Elegance", colors: ["#4D263F", "#5A4868", "#A58BA0", "#D1B6A4", "#80604E"] },
  { name: "Warm Minimal", colors: ["#F2E8D8", "#D9C8B4", "#B6A18E", "#9A8575", "#E6D9C8"] }
];

const designs = [
  { id: "solid", name: "Solid" },
  { id: "stripes", name: "Stripes" },
  { id: "diagonal", name: "Diagonal" },
  { id: "geometric", name: "Geometric" },
  { id: "two-tone", name: "Two Tone" },
  { id: "dots", name: "Polka Dots" }
];

const colorFamilies = [
  { id: "all", label: "All Colors" },
  { id: "warm", label: "Warm" },
  { id: "cool", label: "Cool" },
  { id: "green", label: "Greens" },
  { id: "blue", label: "Blues" },
  { id: "purple", label: "Purples" },
  { id: "pink", label: "Pinks" },
  { id: "neutral", label: "Neutrals" }
];

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => Math.round(
    255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)))
  );

  return "#" + [f(0), f(8), f(4)]
    .map(v => v.toString(16).padStart(2, "0"))
    .join("");
}

function cloneWalls(walls) {
  return walls.map(wall => ({
    ...wall,
    points: wall.points.map(point => ({ ...point }))
  }));
}

function PaintStudio() {
  const navigate = useNavigate();

  const [favoriteSaving, setFavoriteSaving] = useState(false);
  const [image, setImage] = useState("");
  const [cropImage, setCropImage] = useState("");
  const [showCropEditor, setShowCropEditor] = useState(false);

  // Image ownership confirmation
  const [imageOwnership, setImageOwnership] = useState(false);

  const [color, setColor] = useState("#C98F91");
  const [secondaryColor, setSecondaryColor] = useState("#E8DCCB");
  const [pattern, setPattern] = useState("solid");
  const [intensity, setIntensity] = useState(65);

  const [wallPoints, setWallPoints] = useState([]);
  const [appliedWallPoints, setAppliedWallPoints] = useState([]);
  const [selectedWallId, setSelectedWallId] = useState(null);

  const [showOriginal, setShowOriginal] = useState(false);
  const [showBeforeAfter, setShowBeforeAfter] = useState(true);
  const [search, setSearch] = useState("");
  const [family, setFamily] = useState("all");
  const [visibleCount, setVisibleCount] = useState(48);
  const [activePalette, setActivePalette] = useState("");

  const [error, setError] = useState("");
  const [aiImage, setAiImage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMode, setAiMode] = useState("wall");

  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const fileRef = useRef(null);
  const canvasRef = useRef(null);
  const originalCanvasRef = useRef(null);
  const imageRef = useRef(null);

  const createSnapshot = useCallback(() => ({
    wallPoints: wallPoints.map(point => ({ ...point })),
    appliedWallPoints: cloneWalls(appliedWallPoints),
    color,
    secondaryColor,
    pattern,
    intensity,
    selectedWallId,
    activePalette
  }), [
    wallPoints,
    appliedWallPoints,
    color,
    secondaryColor,
    pattern,
    intensity,
    selectedWallId,
    activePalette
  ]);

  const saveHistory = useCallback(() => {
    setUndoStack(old => [...old, createSnapshot()]);
    setRedoStack([]);
  }, [createSnapshot]);

  const restoreSnapshot = snapshot => {
    setWallPoints(snapshot.wallPoints.map(point => ({ ...point })));
    setAppliedWallPoints(cloneWalls(snapshot.appliedWallPoints));
    setColor(snapshot.color);
    setSecondaryColor(snapshot.secondaryColor);
    setPattern(snapshot.pattern);
    setIntensity(snapshot.intensity);
    setSelectedWallId(snapshot.selectedWallId);
    setActivePalette(snapshot.activePalette);
    setAiImage("");
    setError("");
  };

  const undoAction = () => {
    if (!undoStack.length) return;

    setRedoStack(old => [...old, createSnapshot()]);
    restoreSnapshot(undoStack[undoStack.length - 1]);
    setUndoStack(old => old.slice(0, -1));
  };

  const redoAction = () => {
    if (!redoStack.length) return;

    setUndoStack(old => [...old, createSnapshot()]);
    restoreSnapshot(redoStack[redoStack.length - 1]);
    setRedoStack(old => old.slice(0, -1));
  };

  const allColors = useMemo(() => {
    const result = [];

    for (let hue = 0; hue < 360; hue += 2) {
      for (const saturation of [20, 35, 50, 65, 80, 95]) {
        for (const lightness of [20, 30, 40, 50, 60, 70, 80, 90]) {
          result.push({
            hex: hslToHex(hue, saturation, lightness),
            hue,
            saturation,
            lightness,
            name: `H${hue} S${saturation} L${lightness}`
          });
        }
      }
    }

    for (const lightness of [10, 20, 30, 40, 50, 60, 70, 80, 90, 95]) {
      result.push({
        hex: hslToHex(0, 0, lightness),
        hue: 0,
        saturation: 0,
        lightness,
        name: `Neutral ${lightness}`
      });
    }

    return result;
  }, []);

  const filteredColors = useMemo(() => {
    const query = search.trim().toLowerCase();

    return allColors.filter(item => {
      const matchesSearch =
        !query ||
        item.hex.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query);

      let matchesFamily = true;

      if (family === "warm") matchesFamily = item.hue < 60 || item.hue >= 330;
      if (family === "cool") matchesFamily = item.hue >= 160 && item.hue < 280;
      if (family === "green") matchesFamily = item.hue >= 70 && item.hue < 160;
      if (family === "blue") matchesFamily = item.hue >= 190 && item.hue < 260;
      if (family === "purple") matchesFamily = item.hue >= 260 && item.hue < 290;
      if (family === "pink") matchesFamily = item.hue >= 290 && item.hue < 350;
      if (family === "neutral") matchesFamily = item.saturation === 0;

      return matchesSearch && matchesFamily;
    });
  }, [allColors, search, family]);

  const chooseColor = value => {
    saveHistory();
    setColor(value);
    setActivePalette("");
    setAiImage("");

    if (selectedWallId !== null) {
      setAppliedWallPoints(old =>
        old.map(wall =>
          wall.id === selectedWallId
            ? { ...wall, color: value, colorName: "Custom Color" }
            : wall
        )
      );
    }
  };

  const choosePalette = palette => {
    saveHistory();
    setActivePalette(palette.name);
    setColor(palette.colors[0]);
    setSecondaryColor(palette.colors[1] || "#E8DCCB");
    setAiImage("");

    if (selectedWallId !== null) {
      setAppliedWallPoints(old =>
        old.map(wall =>
          wall.id === selectedWallId
            ? {
                ...wall,
                color: palette.colors[0],
                secondaryColor: palette.colors[1] || "#E8DCCB",
                colorName: palette.name
              }
            : wall
        )
      );
    }
  };

  const selectWall = id => {
    const wall = appliedWallPoints.find(item => item.id === id);
    if (!wall) return;

    setSelectedWallId(id);
    setColor(wall.color);
    setSecondaryColor(wall.secondaryColor);
    setPattern(wall.pattern);
    setIntensity(wall.intensity);
    setActivePalette(
      wall.colorName === "Custom Color" ? "" : wall.colorName
    );
    setWallPoints([]);
    setAiImage("");
  };

  const addWallPoint = event => {
    if (!image || aiImage) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    const point = {
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
    };

    setWallPoints(old => [...old, point]);
    setError("");
  };

  const applyWallSelection = () => {
    if (wallPoints.length < 3) {
      setError("Wall select karne ke liye kam se kam 3 points click karo.");
      return;
    }

    saveHistory();

    if (selectedWallId !== null) {
      setAppliedWallPoints(old =>
        old.map(wall =>
          wall.id === selectedWallId
            ? {
                ...wall,
                points: wallPoints.map(point => ({ ...point })),
                color,
                secondaryColor,
                pattern,
                intensity,
                colorName: activePalette || "Custom Color"
              }
            : wall
        )
      );
    } else {
      const id = Date.now();

      setAppliedWallPoints(old => [
        ...old,
        {
          id,
          points: wallPoints.map(point => ({ ...point })),
          color,
          secondaryColor,
          pattern,
          intensity,
          colorName: activePalette || "Custom Color"
        }
      ]);

      setSelectedWallId(id);
    }

    setWallPoints([]);
    setAiImage("");
    setError("");
  };

  const uploadImage = event => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Only JPG, PNG aur WebP images upload kar sakte ho.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image size 10 MB se kam honi chahiye.");
      return;
    }

    // Reset ownership confirmation for a new upload
    setImageOwnership(false);

    const reader = new FileReader();

    reader.onload = () => {
      setCropImage(String(reader.result));
      setShowCropEditor(true);
      setError("");
    };

    reader.onerror = () => setError("Image read nahi ho paayi.");
    reader.readAsDataURL(file);
  };

  const handleCropCancel = () => {
    setShowCropEditor(false);
    setCropImage("");
  };

  const handleCropComplete = result => {
    const nextImage =
      typeof result === "string"
        ? result
        : result?.image || result?.dataUrl || result?.croppedImage;

    if (!nextImage) {
      setError("Crop editor se valid image nahi mili.");
      return;
    }

    saveHistory();
    setImage(nextImage);

    // Reset ownership confirmation for the cropped image
    setImageOwnership(false);

    setShowCropEditor(false);
    setCropImage("");
    setWallPoints([]);
    setAppliedWallPoints([]);
    setSelectedWallId(null);
    setAiImage("");
    setShowOriginal(false);
    setError("");
  };

  const changePattern = value => {
    saveHistory();
    setPattern(value);
    setAiImage("");

    if (selectedWallId !== null) {
      setAppliedWallPoints(old =>
        old.map(wall =>
          wall.id === selectedWallId
            ? { ...wall, pattern: value }
            : wall
        )
      );
    }
  };

  const changeSecondaryColor = value => {
    saveHistory();
    setSecondaryColor(value);
    setAiImage("");

    if (selectedWallId !== null) {
      setAppliedWallPoints(old =>
        old.map(wall =>
          wall.id === selectedWallId
            ? { ...wall, secondaryColor: value }
            : wall
        )
      );
    }
  };

  const changeIntensity = value => {
    const nextValue = Number(value);
    saveHistory();
    setIntensity(nextValue);
    setAiImage("");

    if (selectedWallId !== null) {
      setAppliedWallPoints(old =>
        old.map(wall =>
          wall.id === selectedWallId
            ? { ...wall, intensity: nextValue }
            : wall
        )
      );
    }
  };

  const drawWallPattern = (ctx, width, height, wall) => {
    ctx.fillStyle = wall.secondaryColor;
    ctx.strokeStyle = wall.secondaryColor;
    ctx.globalAlpha = Math.min(0.8, wall.intensity / 100);

    if (wall.pattern === "stripes") {
      for (let x = 0; x < width; x += Math.max(25, width * 0.045)) {
        ctx.fillRect(x, 0, Math.max(6, width * 0.012), height);
      }
    } else if (wall.pattern === "diagonal") {
      ctx.lineWidth = Math.max(3, width * 0.008);

      for (let x = -height; x < width + height; x += Math.max(30, width * 0.06)) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + height, height);
        ctx.stroke();
      }
    } else if (wall.pattern === "dots") {
      const step = Math.max(24, width * 0.055);

      for (let x = step / 2; x < width; x += step) {
        for (let y = step / 2; y < height; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, Math.max(3, width * 0.007), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (wall.pattern === "geometric") {
      const step = Math.max(70, width * 0.13);

      for (let x = 0; x < width + step; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + step * 0.65, height / 2);
        ctx.lineTo(x, height);
        ctx.closePath();
        ctx.fill();
      }
    } else if (wall.pattern === "two-tone") {
      ctx.fillRect(0, height * 0.58, width, height * 0.42);
    }

    ctx.globalAlpha = 1;
  };

  const renderCanvas = useCallback((img, canvas, isOriginal = false) => {
    if (!img || !canvas) return;

    const scale = Math.min(1, 1400 / img.naturalWidth);
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    if (isOriginal || showOriginal) return;

    appliedWallPoints.forEach(wall => {
      if (wall.points.length < 3) return;

      ctx.save();
      ctx.beginPath();

      wall.points.forEach((point, index) => {
        const x = point.x * width;
        const y = point.y * height;

        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.closePath();
      ctx.clip();

      ctx.globalAlpha = wall.intensity / 100;
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = wall.color;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";

      if (wall.pattern !== "solid") {
        drawWallPattern(ctx, width, height, wall);
      }

      ctx.restore();
    });

    if (wallPoints.length > 0) {
      ctx.beginPath();

      wallPoints.forEach((point, index) => {
        const x = point.x * width;
        const y = point.y * height;

        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.strokeStyle = "#762F46";
      ctx.lineWidth = Math.max(2, width * 0.002);
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      wallPoints.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x * width, point.y * height, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#fffaf5";
        ctx.fill();
        ctx.strokeStyle = "#762F46";
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }
  }, [appliedWallPoints, wallPoints, showOriginal]);

  useEffect(() => {
    if (!image) {
      imageRef.current = null;
      return;
    }

    let cancelled = false;
    const img = new Image();

    img.onload = () => {
      if (cancelled) return;
      imageRef.current = img;
      renderCanvas(img, originalCanvasRef.current, true);
      renderCanvas(img, canvasRef.current, false);
    };

    img.onerror = () => setError("Could not display this image.");
    img.src = image;

    return () => {
      cancelled = true;
    };
  }, [image, renderCanvas]);

  useEffect(() => {
    if (!imageRef.current) return;

    renderCanvas(imageRef.current, originalCanvasRef.current, true);
    renderCanvas(imageRef.current, canvasRef.current, false);
  }, [renderCanvas]);

  const generateAIDesign = async () => {
    if (!image) {
      setError("Upload a room photo first.");
      fileRef.current?.click();
      return;
    }

    if (aiMode === "wall" && !appliedWallPoints.length) {
      setError("Pehle wall ke coordinates select karke Apply Selection karo.");
      return;
    }

    try {
      setAiLoading(true);
      setAiImage("");
      setError("");

      const sourceImage = new Image();

      await new Promise((resolve, reject) => {
        sourceImage.onload = resolve;
        sourceImage.onerror = () => reject(
          new Error("Could not load the room photo.")
        );
        sourceImage.src = image;
      });

      const width = sourceImage.naturalWidth;
      const height = sourceImage.naturalHeight;

      const imageCanvas = document.createElement("canvas");
      imageCanvas.width = width;
      imageCanvas.height = height;

      const imageCtx = imageCanvas.getContext("2d");
      if (!imageCtx) throw new Error("Could not prepare the photo.");

      imageCtx.drawImage(sourceImage, 0, 0, width, height);

      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = width;
      maskCanvas.height = height;

      const maskCtx = maskCanvas.getContext("2d");
      if (!maskCtx) throw new Error("Could not create the AI mask.");

      maskCtx.fillStyle = "#000000";
      maskCtx.fillRect(0, 0, width, height);
      maskCtx.fillStyle = "#FFFFFF";

      if (aiMode === "room") {
        maskCtx.fillRect(0, 0, width, height);
      } else {
        appliedWallPoints.forEach(wall => {
          if (wall.points.length < 3) return;

          maskCtx.beginPath();

          wall.points.forEach((point, index) => {
            const x = point.x * width;
            const y = point.y * height;

            if (index === 0) maskCtx.moveTo(x, y);
            else maskCtx.lineTo(x, y);
          });

          maskCtx.closePath();
          maskCtx.fill();
        });
      }

      const canvasToBlob = canvas => new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
          if (blob) resolve(blob);
          else reject(new Error("Could not prepare the image for AI."));
        }, "image/png");
      });

      const formData = new FormData();

      formData.append("image", await canvasToBlob(imageCanvas), "room-photo.png");
      formData.append("mask", await canvasToBlob(maskCanvas), "wall-mask.png");
      formData.append("mode", aiMode);
      formData.append("color", color);
      formData.append("secondaryColor", secondaryColor);
      formData.append("pattern", pattern);
      formData.append("intensity", String(intensity));

      formData.append("walls", JSON.stringify(
        appliedWallPoints.map(wall => ({
          id: wall.id,
          points: wall.points,
          color: wall.color,
          secondaryColor: wall.secondaryColor,
          pattern: wall.pattern,
          intensity: wall.intensity,
          colorName: wall.colorName
        }))
      ));

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || `AI request failed (${response.status}).`
        );
      }

      if (!data.image) {
        throw new Error("AI server ne image return nahi ki.");
      }

      setAiImage(data.image);
      setShowBeforeAfter(true);
      setShowOriginal(false);
    } catch (err) {
      setError(err.message || "AI service connect nahi ho paayi.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddToFavorites = async () => {
    if (!localStorage.getItem("token")) {
      setError("Favourite save karne ke liye pehle login karo.");
      navigate("/login");
      return;
    }

    if (!image) {
      setError("Pehle room photo upload karo.");
      return;
    }

    const canvas = canvasRef.current;
    const previewImage = aiImage || (
      canvas ? canvas.toDataURL("image/png") : ""
    );

    if (!previewImage) {
      setError("Favourite save karne se pehle preview ready karo.");
      return;
    }

    try {
      setFavoriteSaving(true);
      setError("");

      await saveDesign({
        title: `WallGlow Design ${new Date().toLocaleDateString("en-IN")}`,
        originalImage: image,
        previewImage,
        primaryColor: color,
        secondaryColor,
        pattern,
        isFavorite: true,
        favorite: true,
        walls: appliedWallPoints.map(wall => ({
          id: wall.id,
          points: wall.points,
          color: wall.color,
          secondaryColor: wall.secondaryColor,
          pattern: wall.pattern,
          intensity: wall.intensity,
          colorName: wall.colorName
        }))
      });

      navigate("/favorites");
    } catch (err) {
      setError(err.message || "Favourite save nahi ho paya.");
    } finally {
      setFavoriteSaving(false);
    }
  };

  const handleShadeFavorite = async (shade, event) => {
    event.stopPropagation();

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setFavoriteSaving(true);
      setError("");

      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg"
          width="600" height="400">
          <rect width="100%" height="100%" fill="${shade.hex}"/>
          <text x="30" y="340"
            font-family="Arial"
            font-size="32"
            fill="#ffffff">
            ${shade.hex.toUpperCase()}
          </text>
        </svg>
      `;

      const shadePreview =
        `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

      const favoriteData = {
        title: `Favorite Shade - ${shade.name}`,
        originalImage: shadePreview,
        previewImage: shadePreview,
        primaryColor: shade.hex,
        secondaryColor: shade.hex,
        pattern: "solid",
        isFavorite: true
      };

      await saveDesign(favoriteData);

      navigate("/favorites");

    } catch (err) {
      console.error("Favorite error:", err);
      setError(err.message || "Shade favourite save nahi hua.");
    } finally {
      setFavoriteSaving(false);
    }
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const url = aiImage || (canvas ? canvas.toDataURL("image/png") : "");

    if (!url) {
      setError("Download karne se pehle photo upload karo.");
      return;
    }

    const link = document.createElement("a");
    link.href = url;
    link.download = aiImage
      ? "wallglow-ai-design.png"
      : "wallglow-preview.png";
    link.click();
  };

  return (
    <>
      <Navbar />

      <main className="paint-studio">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={uploadImage}
        />

        {showCropEditor && cropImage && (
          <ImageCropEditor
            image={cropImage}
            onCancel={handleCropCancel}
            onComplete={handleCropComplete}
          />
        )}

        <canvas
          ref={originalCanvasRef}
          className="ps-hidden-canvas"
        />

        <section className="ps-hero">
          <div className="ps-hero-copy">
            <span className="ps-eyebrow">
              WALLGLOW · COLOR YOUR WORLD
            </span>

            <h1>
              A world of color.
              <br />
              <em>A room that feels like you.</em>
            </h1>

            <p>
              Upload your room, select each wall and preview different colors.
            </p>

            <div className="ps-hero-actions">
              <button
                className="ps-button ps-button-primary"
                onClick={() => fileRef.current?.click()}
              >
                {image ? "Change room photo ↗" : "Upload your room ↗"}
              </button>

              <button
                className="ps-button ps-button-outline"
                onClick={() =>
                  document.getElementById("ps-library")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Explore colors
              </button>
            </div>

            <div className="ps-hero-meta">
              <span>
                ✳ {allColors.length.toLocaleString()} generated shades
              </span>
              <span>✳ Multiple wall colors</span>
            </div>
          </div>

          <div className="ps-hero-art">
            <div
              className="ps-art-wall"
              style={{ backgroundColor: color }}
            >
              <div className="ps-art-window">
                <div className="ps-art-window-view" />
                <div className="ps-art-window-divider" />
              </div>

              <div className="ps-art-frame">
                <div className="ps-art-circle" />
                <div className="ps-art-arch" />
              </div>

              <div className="ps-art-side-frame" />
            </div>

            <div className="ps-art-floor" />
            <div className="ps-art-rug" />

            <div className="ps-art-sofa">
              <div className="ps-art-sofa-back" />
              <div className="ps-art-sofa-seat" />
              <div className="ps-art-sofa-arm" />
              <div className="ps-art-sofa-cushion" />
              <div className="ps-art-sofa-leg" />
            </div>

            <div className="ps-art-plant">
              <i /><i /><i /><i /><div />
            </div>

            <div className="ps-art-caption">
              <span
                className="ps-art-caption-dot"
                style={{ backgroundColor: color }}
              />
              Your next favorite shade
            </div>
          </div>
        </section>

        {error && (
          <div className="ps-error" role="alert">
            {error}
            <button
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {/* IMAGE OWNERSHIP COMPONENT */}
        {image && (
          <ImageOwnership
            checked={imageOwnership}
            onChange={(checked) => {
              setImageOwnership(checked);
              setError("");
            }}
          />
        )}

        <section className="ps-palette-section">
          <div className="ps-section-heading">
            <div>
              <span className="ps-eyebrow">CURATED COLOR STORIES</span>
              <h2>Find your color mood.</h2>
              <p>Choose a palette, then customize each wall.</p>
            </div>
          </div>

          <div className="ps-palette-grid">
            {palettes.map(palette => (
              <button
                key={palette.name}
                className={`ps-palette-card ${
                  activePalette === palette.name ? "active" : ""
                }`}
                onClick={() => choosePalette(palette)}
              >
                <div className="ps-palette-swatches">
                  {palette.colors.map(hex => (
                    <span
                      key={hex}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>

                <div className="ps-palette-info">
                  <strong>{palette.name}</strong>
                  <span>{palette.name}</span>
                </div>

                <span className="ps-palette-arrow">↗</span>
              </button>
            ))}
          </div>
        </section>

        <section className="ps-studio-section" id="ps-library">
          <div className="ps-section-heading">
            <div>
              <span className="ps-eyebrow">
                YOUR PERSONAL COLOR STUDIO
              </span>
              <h2>Make it yours.</h2>
              <p>
                Select a wall, choose a color and continue with another wall.
              </p>
            </div>
          </div>

          <div className="ps-studio-grid">
            <aside className="ps-sidebar">
              <div className="ps-panel">
                <div className="ps-panel-heading">
                  <span className="ps-number">01</span>
                  <div>
                    <h3>Selected shade</h3>
                    <p>Color for the selected wall or next wall</p>
                  </div>
                </div>

                <div className="ps-current-color">
                  <div
                    className="ps-current-swatch"
                    style={{ backgroundColor: color }}
                  />
                  <div>
                    <strong>{color.toUpperCase()}</strong>
                    <span>{activePalette || "Custom selection"}</span>
                  </div>
                </div>

                <label className="ps-custom-label">
                  Pick any custom color
                  <input
                    type="color"
                    value={color}
                    onChange={event => chooseColor(event.target.value)}
                  />
                </label>

                <div className="ps-secondary-color">
                  <label htmlFor="ps-secondary-color">
                    Second color
                  </label>

                  <div>
                    <input
                      id="ps-secondary-color"
                      type="color"
                      value={secondaryColor}
                      onChange={event =>
                        changeSecondaryColor(event.target.value)
                      }
                    />
                    <code>{secondaryColor.toUpperCase()}</code>
                  </div>
                </div>

                <div className="ps-pattern-options">
                  <h4>Wall pattern</h4>
                  <div>
                    {designs.map(item => (
                      <button
                        key={item.id}
                        className={pattern === item.id ? "active" : ""}
                        onClick={() => changePattern(item.id)}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ps-intensity-control">
                  <label htmlFor="ps-intensity">
                    Paint intensity: {intensity}%
                  </label>

                  <input
                    id="ps-intensity"
                    type="range"
                    min="10"
                    max="100"
                    value={intensity}
                    onChange={event =>
                      changeIntensity(event.target.value)
                    }
                  />
                </div>
              </div>

              <div className="ps-panel">
                <div className="ps-panel-heading">
                  <span className="ps-number">02</span>
                  <div>
                    <h3>Your selected walls</h3>
                    <p>
                      {appliedWallPoints.length} wall(s) added
                    </p>
                  </div>
                </div>

                {appliedWallPoints.length === 0 ? (
                  <p>
                    Upload a room photo, click at least three points around
                    a wall, then press Apply wall.
                  </p>
                ) : (
                  <div className="ps-wall-list">
                    {appliedWallPoints.map((wall, index) => (
                      <div key={wall.id}>
                        <button
                          className={`ps-wall-item ${
                            selectedWallId === wall.id ? "active" : ""
                          }`}
                          onClick={() => selectWall(wall.id)}
                        >
                          <span
                            className="ps-wall-color"
                            style={{ backgroundColor: wall.color }}
                          />

                          <div style={{ flex: 1 }}>
                            <strong>Wall {index + 1}</strong>
                            <span
                              style={{
                                display: "block",
                                fontSize: 12
                              }}
                            >
                              {wall.color.toUpperCase()} · {wall.pattern}
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            saveHistory();
                            setAppliedWallPoints(old =>
                              old.filter(item => item.id !== wall.id)
                            );
                            if (selectedWallId === wall.id) {
                              setSelectedWallId(null);
                            }
                            setAiImage("");
                          }}
                        >
                          Remove wall
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  className="ps-button ps-button-outline"
                  onClick={() => {
                    saveHistory();
                    setWallPoints([]);
                    setSelectedWallId(null);
                  }}
                >
                  Add a new wall
                </button>
              </div>
            </aside>

            <div className="ps-main">
              <div className="ps-preview-panel">
                <div className="ps-preview-header">
                  <div>
                    <span className="ps-eyebrow">LIVE PREVIEW</span>
                    <h3>See your idea come to life.</h3>
                  </div>

                  <div className="ps-preview-tools">
                    <button
                      className="ps-icon-button"
                      onClick={undoAction}
                      disabled={!undoStack.length}
                      title="Undo"
                    >
                      ↶
                    </button>

                    <button
                      className="ps-icon-button"
                      onClick={redoAction}
                      disabled={!redoStack.length}
                      title="Redo"
                    >
                      ↷
                    </button>
                  </div>
                </div>

                {!image ? (
                  <div
                    className="ps-empty-preview"
                    onClick={() => fileRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={event => {
                      if (
                        event.key === "Enter" ||
                        event.key === " "
                      ) {
                        fileRef.current?.click();
                      }
                    }}
                  >
                    <div className="ps-empty-icon">↥</div>
                    <h3>Your room will appear here</h3>
                    <p>Upload a clear photo of your room to start painting.</p>

                    <button
                      className="ps-button ps-button-primary"
                      onClick={event => {
                        event.stopPropagation();
                        fileRef.current?.click();
                      }}
                    >
                      Upload room photo
                    </button>
                  </div>
                ) : (
                  <div className="ps-preview-image-wrap">
                    <canvas
                      ref={canvasRef}
                      className="ps-room-canvas"
                      onClick={addWallPoint}
                    />

                    {aiImage && (
                      <img
                        src={aiImage}
                        alt="AI generated room design"
                        className="ps-ai-result"
                      />
                    )}

                    {wallPoints.length > 0 && (
                      <div className="ps-point-hint">
                        {wallPoints.length} points selected
                      </div>
                    )}
                  </div>
                )}

                <div className="ps-preview-footer">
                  <div className="ps-preview-status">
                    <span
                      className={`ps-status-dot ${image ? "ready" : ""}`}
                    />
                    {image ? "Room photo loaded" : "Waiting for room photo"}
                  </div>

                  <div className="ps-preview-buttons">
                    <button
                      className="ps-button ps-button-outline"
                      onClick={() => fileRef.current?.click()}
                    >
                      {image ? "Change photo" : "Upload photo"}
                    </button>

                    <button
                      className="ps-button ps-button-primary"
                      onClick={applyWallSelection}
                      disabled={wallPoints.length < 3}
                    >
                      Apply wall
                    </button>
                  </div>
                </div>

                {image && (
                  <div className="ps-ai-controls">
                    <div>
                      <strong>AI room redesign</strong>
                      <p>Generate an AI preview using your selected colors.</p>
                    </div>

                    <div className="ps-ai-mode">
                      <button
                        className={aiMode === "wall" ? "active" : ""}
                        onClick={() => setAiMode("wall")}
                      >
                        Selected wall
                      </button>

                      <button
                        className={aiMode === "room" ? "active" : ""}
                        onClick={() => setAiMode("room")}
                      >
                        Whole room
                      </button>
                    </div>

                    <button
                      className="ps-button ps-button-primary"
                      onClick={generateAIDesign}
                      disabled={aiLoading}
                    >
                      {aiLoading
                        ? "Generating preview..."
                        : "Generate AI preview"}
                    </button>
                  </div>
                )}

                {image && (
                  <div className="ps-design-actions">
                    <button
                      className="ps-button ps-button-outline"
                      onClick={downloadImage}
                    >
                      Download preview
                    </button>

                    <button
                      className="ps-button ps-button-outline"
                      onClick={handleAddToFavorites}
                      disabled={favoriteSaving}
                    >
                      <Heart size={56} />
                      {favoriteSaving ? "Saving..." : "Add to Favorites"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="ps-color-library">
          <div className="ps-section-heading">
            <div>
              <span className="ps-eyebrow">
                THE WALLGLOW COLOR LIBRARY
              </span>
              <h2>Thousands of shades. One perfect choice.</h2>
              <p>Choose your favorite shade and save it for later.</p>
            </div>
          </div>

          <div className="ps-color-tools">
            <div className="ps-search-box">
              <span>⌕</span>

              <input
                type="search"
                value={search}
                onChange={event => {
                  setSearch(event.target.value);
                  setVisibleCount(48);
                }}
                placeholder="Search color name or hex..."
                aria-label="Search colors"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setVisibleCount(48);
                  }}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <div className="ps-family-filters">
              {colorFamilies.map(item => (
                <button
                  key={item.id}
                  className={family === item.id ? "active" : ""}
                  onClick={() => {
                    setFamily(item.id);
                    setVisibleCount(48);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ps-color-grid">
            {filteredColors.slice(0, visibleCount).map(shade => (
              <div
                key={`${shade.hex}-${shade.name}`}
                className={`ps-color-swatch-wrap ${
                  color === shade.hex ? "selected" : ""
                }`}
              >
                <button
                  type="button"
                  className={`ps-color-swatch ${
                    color === shade.hex ? "selected" : ""
                  }`}
                  onClick={() => chooseColor(shade.hex)}
                  title={`Select ${shade.name} ${shade.hex}`}
                >
                  <span
                    className="ps-swatch-color"
                    style={{ backgroundColor: shade.hex }}
                  />
                  <span className="ps-swatch-name">{shade.name}</span>
                  <span className="ps-swatch-hex">{shade.hex}</span>
                </button>

                <button
                  type="button"
                  className="ps-shade-favorite-btn"
                  onClick={(event) => handleShadeFavorite(shade, event)}
                  disabled={favoriteSaving}
                  title="Add to Favorites"
                >
                  <Heart size={16} />
                </button>
              </div>
            ))}
          </div>

          {filteredColors.length > visibleCount && (
            <button
              className="ps-load-more-btn"
              onClick={() =>
                setVisibleCount(count => count + 48)
              }
            >
              Load More Colors
            </button>
          )}

          {filteredColors.length === 0 && (
            <p className="ps-no-colors">
              No colors found. Try another search.
            </p>
          )}
        </section>

        <section className="ps-bottom-banner">
          <h3>A new look, before the first coat.</h3>
          <p>
            Explore colors, preview your ideas and create your next room
            transformation with WallGlow.
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default PaintStudio;
