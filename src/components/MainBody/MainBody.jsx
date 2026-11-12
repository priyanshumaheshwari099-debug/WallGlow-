import React from "react";
import "./MainBody.css";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Palette,
  Upload,
  WandSparkles
} from "lucide-react";

export default function MainBody() {
  const colors = [
    { name: "Warm Beige", hex: "#D8C2A5" },
    { name: "Dusty Rose", hex: "#C98791" },
    { name: "Olive", hex: "#85876A" },
    { name: "Burgundy", hex: "#792E46" },
    { name: "Cream", hex: "#F1E7D5" }
  ];

  return (
    <main className="main-body">
      <section className="mb-hero">
        <div className="mb-content">
          <div className="mb-eyebrow">
            <Sparkles size={16} />
            <span>YOUR HOME, YOUR COLORS</span>
          </div>

          <h1>
            Give Your Walls
            <br />
            A <span>Beautiful New</span>
            <br />
            Look.
          </h1>

          <p className="mb-description">
            Discover the perfect paint color for your home.
            Upload your room photo, explore beautiful shades,
            and visualize your dream walls before painting.
          </p>

          <div className="mb-actions">
            <button
              className="mb-primary-btn"
              onClick={() =>
                document.getElementById("paint-visualizer")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Try It For Free
              <ArrowRight size={19} />
            </button>

            <button
              className="mb-secondary-btn"
              onClick={() =>
                document.getElementById("paint-colors")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Palette size={18} />
              Explore Colors
            </button>
          </div>

          <div className="mb-trust">
            <span><CheckCircle2 size={17} /> Easy to use</span>
            <span><CheckCircle2 size={17} /> Explore colors</span>
            <span><CheckCircle2 size={17} /> Preview before painting</span>
          </div>
        </div>

        <div className="mb-visual">
          <div className="mb-image-card">
            <div className="mb-image-top">
              <div>
                <span className="mb-live-dot"></span>
                <span>YOUR NEXT ROOM MAKEOVER</span>
              </div>
              <span className="mb-image-number">01 / 03</span>
            </div>

            <div className="mb-room-scene">
              <div className="mb-room-wall">
                <div className="mb-wall-frame mb-frame-one">
                  <div className="mb-frame-art">✳</div>
                </div>
                <div className="mb-wall-frame mb-frame-two">
                  <div className="mb-frame-art">❋</div>
                </div>
                <div className="mb-wall-shelf"></div>
                <div className="mb-plant">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <i></i>
                </div>
              </div>

              <div className="mb-sofa">
                <div className="mb-sofa-back"></div>
                <div className="mb-sofa-seat"></div>
                <div className="mb-sofa-arm left"></div>
                <div className="mb-sofa-arm right"></div>
                <div className="mb-cushion one"></div>
                <div className="mb-cushion two"></div>
                <div className="mb-sofa-leg left"></div>
                <div className="mb-sofa-leg right"></div>
              </div>

              <div className="mb-side-table">
                <div></div>
                <span></span>
              </div>

              <div className="mb-floor"></div>
              <div className="mb-rug"></div>
            </div>

            <div className="mb-image-bottom">
              <div>
                <span className="mb-small-label">FEATURED SHADE</span>
                <h3>Rosewood Elegance</h3>
                <p>A little warmth. A lot of character.</p>
              </div>
              <div className="mb-feature-swatch"></div>
            </div>
          </div>

          <div className="mb-floating-card">
            <div className="mb-floating-icon">
              <WandSparkles size={21} />
            </div>
            <div>
              <strong>Your vision, reimagined</strong>
              <span>Find your perfect shade</span>
            </div>
          </div>

          <div className="mb-decor-circle"></div>
        </div>
      </section>

      <section className="mb-color-section" id="paint-colors">
        <div className="mb-section-heading">
          <div>
            <span className="mb-section-label">A WORLD OF SHADES</span>
            <h2>Find Your <span>Perfect Color.</span></h2>
          </div>
          <p>
            From soft neutrals to bold statement shades,
            discover the color that feels like home.
          </p>
        </div>

        <div className="mb-color-list">
          {colors.map((color) => (
            <button
              className="mb-color-item"
              key={color.hex}
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("paintColorSelected", {
                    detail: color
                  })
                );
                document.getElementById("paint-visualizer")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              title={`Try ${color.name}`}
            >
              <span
                className="mb-color-circle"
                style={{ backgroundColor: color.hex }}
              >
                <span className="mb-color-arrow">
                  <ArrowRight size={16} />
                </span>
              </span>
              <span className="mb-color-name">{color.name}</span>
              <span className="mb-color-hex">{color.hex}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-start-section" id="paint-visualizer">
        <div className="mb-start-icon">
          <Upload size={25} />
        </div>
        <div className="mb-start-copy">
          <span className="mb-section-label">LET'S GET STARTED</span>
          <h2>Ready to transform your walls?</h2>
          <p>
            Your dream room starts with one photo.
            Upload your room image and begin exploring colors.
          </p>
        </div>
        <button
          className="mb-primary-btn"
          onClick={() =>
            window.dispatchEvent(new Event("openPaintUploader"))
          }
        >
          Start Visualizing
          <ArrowRight size={19} />
        </button>
      </section>
    </main>
  );
}