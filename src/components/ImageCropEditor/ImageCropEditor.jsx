
import { useEffect, useRef, useState } from "react";
import "./ImageCropEditor.css";

const RATIOS = [
  { label: "Free", value: null },
  { label: "9:16", value: 9 / 16 },
  { label: "4:5", value: 4 / 5 },
  { label: "1:1", value: 1 },
  { label: "16:9", value: 16 / 9 },
];

const MIN_SIZE = 45;

function ImageCropEditor({ image, onCancel, onComplete }) {
  const stageRef = useRef(null);
  const imageRef = useRef(null);
  const dragRef = useRef(null);

  const [imageBox, setImageBox] = useState(null);
  const [crop, setCrop] = useState(null);
  const [ratio, setRatio] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [working, setWorking] = useState(false);

  const measureImage = () => {
    const stage = stageRef.current;
    const img = imageRef.current;
    if (!stage || !img || !img.naturalWidth) return;

    const stageRect = stage.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    const box = {
      x: imgRect.left - stageRect.left,
      y: imgRect.top - stageRect.top,
      width: imgRect.width,
      height: imgRect.height,
    };

    setImageBox(box);
    setCrop((old) => {
      if (old) {
        return {
          x: Math.max(box.x, Math.min(old.x, box.x + box.width - MIN_SIZE)),
          y: Math.max(box.y, Math.min(old.y, box.y + box.height - MIN_SIZE)),
          width: Math.min(old.width, box.width),
          height: Math.min(old.height, box.height),
        };
      }

      const width = box.width * 0.82;
      const height = box.height * 0.82;

      return {
        x: box.x + (box.width - width) / 2,
        y: box.y + (box.height - height) / 2,
        width,
        height,
      };
    });
  };

  useEffect(() => {
    const img = imageRef.current;
    if (!img) return;

    if (img.complete) measureImage();
    img.addEventListener("load", measureImage);
    window.addEventListener("resize", measureImage);

    return () => {
      img.removeEventListener("load", measureImage);
      window.removeEventListener("resize", measureImage);
    };
  }, [image, rotation]);

  useEffect(() => {
    if (!imageBox) return;

    setCrop((old) => {
      if (!old) return old;

      let width = old.width;
      let height = old.height;

      if (ratio) {
        if (width / height > ratio) {
          width = height * ratio;
        } else {
          height = width / ratio;
        }
      }

      width = Math.min(width, imageBox.width);
      height = Math.min(height, imageBox.height);

      if (ratio) {
        if (width / height > ratio) width = height * ratio;
        else height = width / ratio;
      }

      return {
        x: imageBox.x + (imageBox.width - width) / 2,
        y: imageBox.y + (imageBox.height - height) / 2,
        width,
        height,
      };
    });
  }, [ratio, imageBox]);

  const clampCrop = (next) => {
    if (!imageBox) return next;

    const width = Math.max(
      Math.min(MIN_SIZE, imageBox.width),
      Math.min(next.width, imageBox.width)
    );
    const height = Math.max(
      Math.min(MIN_SIZE, imageBox.height),
      Math.min(next.height, imageBox.height)
    );

    return {
      x: Math.max(
        imageBox.x,
        Math.min(next.x, imageBox.x + imageBox.width - width)
      ),
      y: Math.max(
        imageBox.y,
        Math.min(next.y, imageBox.y + imageBox.height - height)
      ),
      width,
      height,
    };
  };

  const startDrag = (event, mode) => {
    if (!crop || !imageBox) return;
    event.preventDefault();
    event.stopPropagation();

    event.currentTarget.setPointerCapture?.(event.pointerId);

    dragRef.current = {
      mode,
      startX: event.clientX,
      startY: event.clientY,
      initial: { ...crop },
    };
  };

  const moveDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || !imageBox) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    const initial = drag.initial;

    if (drag.mode === "move") {
      setCrop(
        clampCrop({
          ...initial,
          x: initial.x + dx,
          y: initial.y + dy,
        })
      );
      return;
    }

    let left = initial.x;
    let top = initial.y;
    let right = initial.x + initial.width;
    let bottom = initial.y + initial.height;

    if (drag.mode.includes("w")) {
      left = Math.min(initial.x + dx, right - MIN_SIZE);
    }
    if (drag.mode.includes("e")) {
      right = Math.max(initial.x + initial.width + dx, left + MIN_SIZE);
    }
    if (drag.mode.includes("n")) {
      top = Math.min(initial.y + dy, bottom - MIN_SIZE);
    }
    if (drag.mode.includes("s")) {
      bottom = Math.max(initial.y + initial.height + dy, top + MIN_SIZE);
    }

    left = Math.max(imageBox.x, left);
    top = Math.max(imageBox.y, top);
    right = Math.min(imageBox.x + imageBox.width, right);
    bottom = Math.min(imageBox.y + imageBox.height, bottom);

    let width = right - left;
    let height = bottom - top;

    if (ratio) {
      const horizontal = drag.mode.includes("e") || drag.mode.includes("w");

      if (horizontal) {
        height = width / ratio;
        if (drag.mode.includes("n")) top = bottom - height;
        else bottom = top + height;
      } else {
        width = height * ratio;
        if (drag.mode.includes("w")) left = right - width;
        else right = left + width;
      }

      if (left < imageBox.x) {
        left = imageBox.x;
        width = right - left;
        height = width / ratio;
      }
      if (top < imageBox.y) {
        top = imageBox.y;
        height = bottom - top;
        width = height * ratio;
      }
      if (right > imageBox.x + imageBox.width) {
        right = imageBox.x + imageBox.width;
        width = right - left;
        height = width / ratio;
      }
      if (bottom > imageBox.y + imageBox.height) {
        bottom = imageBox.y + imageBox.height;
        height = bottom - top;
        width = height * ratio;
      }
    }

    setCrop(
      clampCrop({
        x: left,
        y: top,
        width: right - left,
        height: bottom - top,
      })
    );
  };

  const stopDrag = () => {
    dragRef.current = null;
  };

  const changeRatio = (nextRatio) => {
    setRatio(nextRatio);
  };

  const rotatePhoto = () => {
    setRotation((value) => (value + 90) % 360);
    setZoom(1);
    setImageBox(null);
    setCrop(null);
  };

  const createCroppedImage = async () => {
    if (!crop || !imageBox || !imageRef.current) return;

    setWorking(true);

    try {
      const img = imageRef.current;
      const scaleX = img.naturalWidth / imageBox.width;
      const scaleY = img.naturalHeight / imageBox.height;

      const sx = (crop.x - imageBox.x) * scaleX;
      const sy = (crop.y - imageBox.y) * scaleY;
      const sw = crop.width * scaleX;
      const sh = crop.height * scaleY;

      const canvas = document.createElement("canvas");
      canvas.width = Math.round(sw);
      canvas.height = Math.round(sh);

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not available");

      ctx.drawImage(
        img,
        sx,
        sy,
        sw,
        sh,
        0,
        0,
        canvas.width,
        canvas.height
      );

      onComplete(canvas.toDataURL("image/jpeg", 0.94));
    } catch (error) {
      console.error("Crop failed:", error);
      alert("Photo crop nahi ho paaya. Please try again.");
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="ice-backdrop">
      <section className="ice-editor" aria-label="Photo crop editor">
        <header className="ice-header">
          <div>
            <span className="ice-eyebrow">WALLGLOW PHOTO EDITOR</span>
            <h2>Adjust your photo</h2>
            <p>Crop, reposition and prepare your room image.</p>
          </div>

          <button
            className="ice-close"
            type="button"
            onClick={onCancel}
            aria-label="Cancel editing"
          >
            ×
          </button>
        </header>

        <div className="ice-stage" ref={stageRef}>
          <img
            ref={imageRef}
            className="ice-source-image"
            src={image}
            alt="Photo being cropped"
            draggable="false"
            onLoad={measureImage}
            style={{
              transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${zoom})`,
            }}
          />

          {crop && imageBox && (
            <>
              <div
                className="ice-dim ice-dim-top"
                style={{
                  left: imageBox.x,
                  top: imageBox.y,
                  width: imageBox.width,
                  height: Math.max(0, crop.y - imageBox.y),
                }}
              />

              <div
                className="ice-dim ice-dim-bottom"
                style={{
                  left: imageBox.x,
                  top: crop.y + crop.height,
                  width: imageBox.width,
                  height: Math.max(
                    0,
                    imageBox.y + imageBox.height - crop.y - crop.height
                  ),
                }}
              />

              <div
                className="ice-dim"
                style={{
                  left: imageBox.x,
                  top: crop.y,
                  width: Math.max(0, crop.x - imageBox.x),
                  height: crop.height,
                }}
              />

              <div
                className="ice-dim"
                style={{
                  left: crop.x + crop.width,
                  top: crop.y,
                  width: Math.max(
                    0,
                    imageBox.x + imageBox.width - crop.x - crop.width
                  ),
                  height: crop.height,
                }}
              />

              <div
                className="ice-crop-box"
                style={{
                  left: crop.x,
                  top: crop.y,
                  width: crop.width,
                  height: crop.height,
                }}
                onPointerDown={(event) => startDrag(event, "move")}
                onPointerMove={moveDrag}
                onPointerUp={stopDrag}
                onPointerCancel={stopDrag}
                onLostPointerCapture={stopDrag}
              >
                <div className="ice-grid-line ice-grid-v1" />
                <div className="ice-grid-line ice-grid-v2" />
                <div className="ice-grid-line ice-grid-h1" />
                <div className="ice-grid-line ice-grid-h2" />

                {["nw", "n", "ne", "e", "se", "s", "sw", "w"].map((handle) => (
                  <span
                    key={handle}
                    className={`ice-handle ice-handle-${handle}`}
                    onPointerDown={(event) => startDrag(event, handle)}
                    onPointerMove={moveDrag}
                    onPointerUp={stopDrag}
                    onPointerCancel={stopDrag}
                    onLostPointerCapture={stopDrag}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="ice-ratio-section">
          <div className="ice-control-title">
            <strong>Crop ratio</strong>
            <span>Choose a frame or resize freely</span>
          </div>

          <div className="ice-ratio-list">
            {RATIOS.map((item) => (
              <button
                type="button"
                key={item.label}
                className={`ice-ratio-button ${
                  ratio === item.value ? "active" : ""
                }`}
                onClick={() => changeRatio(item.value)}
              >
                <span className={`ice-ratio-icon ice-ratio-${item.label.replace(":", "-")}`}>
                  {item.label === "Free" ? "↗" : ""}
                </span>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="ice-zoom-section">
          <div className="ice-control-title">
            <strong>Zoom</strong>
            <span>{zoom.toFixed(1)}×</span>
          </div>

          <input
            className="ice-zoom-range"
            type="range"
            min="1"
            max="2"
            step="0.1"
            value={zoom}
            onChange={(event) => {
              setZoom(Number(event.target.value));
              setImageBox(null);
              setCrop(null);
            }}
          />
        </div>

        <div className="ice-footer">
          <button
            className="ice-secondary-button"
            type="button"
            onClick={rotatePhoto}
          >
            ↻ Rotate 90°
          </button>

          <div className="ice-footer-actions">
            <button
              className="ice-cancel-button"
              type="button"
              onClick={onCancel}
            >
              Cancel
            </button>

            <button
              className="ice-confirm-button"
              type="button"
              onClick={createCroppedImage}
              disabled={!crop || working}
            >
              {working ? "Processing..." : "Use Photo →"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ImageCropEditor;
