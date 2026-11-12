
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import {
  Palette,
  Sparkles,
  Paintbrush,
  Upload,
  ArrowUpRight,
  ArrowRight,
  Heart,
  CheckCircle2,
  Wand2,
  Eye,
  Layers,
  Home,
} from "lucide-react";

import "./About.css";

const features = [
  {
    icon: <Palette size={24} />,
    number: "01",
    title: "Explore Beautiful Colours",
    description:
      "Discover carefully curated colour palettes that complement your personal style and transform your living space.",
  },
  {
    icon: <Wand2 size={24} />,
    number: "02",
    title: "AI-Powered Visualization",
    description:
      "Experience how different wall colours could look in your own room with intelligent visual previews.",
  },
  {
    icon: <Layers size={24} />,
    number: "03",
    title: "Before & After Preview",
    description:
      "Compare your original room with your new colour concept before making a final decision.",
  },
  {
    icon: <Heart size={24} />,
    number: "04",
    title: "Made for Your Style",
    description:
      "Experiment with colour combinations and create a space that reflects your personality.",
  },
];

const steps = [
  {
    number: "01",
    icon: <Upload size={25} />,
    title: "Upload Your Room",
    description:
      "Choose a clear photo of your room or wall to begin your design journey.",
  },
  {
    number: "02",
    icon: <Paintbrush size={25} />,
    title: "Choose Your Colours",
    description:
      "Explore colour palettes and select the shades you would love to try.",
  },
  {
    number: "03",
    icon: <Eye size={25} />,
    title: "Visualize the Magic",
    description:
      "Preview your transformed space and compare different looks.",
  },
];

const About = () => {
  return (
    <>
    <Navbar/>
    <main className="wg-about">

      {/* HERO SECTION */}

      <section className="wg-about-hero">
        <div className="wg-about-hero-glow" />

        <div className="wg-about-container wg-about-hero-inner">

          <div className="wg-about-hero-content">
            <div className="wg-about-eyebrow">
              <Sparkles size={15} />
              THE STORY BEHIND WALLGLOW
            </div>

            <h1>
              Every wall has
              <br />
              <span>a story to tell.</span>
            </h1>

            <p>
              We believe a beautiful home begins with imagination.
              WallGlow helps you discover inspiring colours,
              experiment with new ideas, and visualize the
              possibilities for your space.
            </p>

            <div className="wg-about-hero-actions">
              <Link to="/paint-studio" className="wg-about-primary-btn">
                Start Designing
                <ArrowUpRight size={19} />
              </Link>

              <a href="#our-story" className="wg-about-secondary-btn">
                Discover Our Story
                <ArrowRight size={17} />
              </a>
            </div>

            <div className="wg-about-hero-note">
              <CheckCircle2 size={17} />
              Explore colours with confidence
            </div>
          </div>

          <div className="wg-about-hero-visual">
            <div className="wg-about-image-frame">
              <img
                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1100&q=85"
                alt="Elegant modern living room with warm neutral interior design"
              />

              <div className="wg-about-floating-card">
                <div className="wg-about-floating-icon">
                  <Palette size={22} />
                </div>

                <div>
                  <strong>Imagine. Visualize.</strong>
                  <span>Bring your colours to life.</span>
                </div>
              </div>
            </div>

            <div className="wg-about-decoration wg-about-decoration-one" />
            <div className="wg-about-decoration wg-about-decoration-two" />
          </div>
        </div>
      </section>

      {/* OUR STORY */}

      <section id="our-story" className="wg-about-story">
        <div className="wg-about-container wg-about-story-grid">

          <div className="wg-about-story-image">
            <img
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=85"
              alt="Beautifully decorated interior with modern furniture and wall colours"
              loading="lazy"
            />

            <div className="wg-about-story-sticker">
              <Sparkles size={22} />
              <span>
                Designed for
                <br />
                dream spaces
              </span>
            </div>
          </div>

          <div className="wg-about-story-content">
            <span className="wg-about-section-label">
              WHO WE ARE
            </span>

            <h2>
              Turning ordinary
              <br />
              walls into
              <em> extraordinary spaces.</em>
            </h2>

            <p>
              Choosing the perfect wall colour can be difficult.
              A shade that looks beautiful in a catalogue may
              feel completely different once applied to your room.
            </p>

            <p>
              That's why WallGlow was created — to make the
              colour-selection journey simpler, more creative,
              and more visual.
            </p>

            <p>
              With our AI-powered wall paint visualizer, you can
              explore ideas using your own room photos and get
              a clearer picture of your dream interior before
              picking up a paintbrush.
            </p>

            <div className="wg-about-story-highlight">
              <Heart size={23} />
              <span>
                Our goal is simple: help everyone feel more
                confident about creating a home they love.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}

      <section className="wg-about-features">
        <div className="wg-about-container">

          <div className="wg-about-section-heading">
            <span className="wg-about-section-label">
              WHY WALLGLOW
            </span>

            <h2>
              Creativity meets
              <em> technology.</em>
            </h2>

            <p>
              Explore the possibilities of your space with
              intuitive tools designed to make colour decisions easier.
            </p>
          </div>

          <div className="wg-about-feature-grid">
            {features.map((feature) => (
              <div className="wg-about-feature-card" key={feature.number}>
                <div className="wg-about-feature-top">
                  <span className="wg-about-feature-icon">
                    {feature.icon}
                  </span>

                  <span className="wg-about-feature-number">
                    {feature.number}
                  </span>
                </div>

                <h3>{feature.title}</h3>
                <p>{feature.description}</p>

                <div className="wg-about-feature-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}

      <section className="wg-about-process">
        <div className="wg-about-container">

          <div className="wg-about-section-heading">
            <span className="wg-about-section-label">
              SIMPLE BY DESIGN
            </span>

            <h2>
              Three steps to
              <em> your dream room.</em>
            </h2>

            <p>
              No complicated design software. Just your room,
              your imagination, and a world of colours.
            </p>
          </div>

          <div className="wg-about-steps">
            {steps.map((step) => (
              <div className="wg-about-step" key={step.number}>
                <div className="wg-about-step-icon">
                  {step.icon}
                </div>

                <span className="wg-about-step-number">
                  STEP {step.number}
                </span>

                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION */}

      <section className="wg-about-mission">
        <div className="wg-about-container wg-about-mission-inner">

          <div className="wg-about-mission-icon">
            <Home size={30} />
          </div>

          <span className="wg-about-mission-label">
            OUR VISION
          </span>

          <h2>
            A world where everyone can
            <em> imagine their perfect home.</em>
          </h2>

          <p>
            We want to make interior colour visualization
            accessible, enjoyable, and inspiring — so every
            home can feel a little more personal.
          </p>

          <div className="wg-about-mission-dots">
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}

      <section className="wg-about-cta-section">
        <div className="wg-about-container">
          <div className="wg-about-cta-card">

            <div className="wg-about-cta-content">
              <div className="wg-about-cta-tag">
                <Sparkles size={15} />
                YOUR CREATIVE JOURNEY STARTS HERE
              </div>

              <h2>
                Your dream walls
                <br />
                are just a click away.
              </h2>

              <p>
                Experiment with inspiring colours and discover
                the possibilities waiting inside your space.
              </p>

              <Link to="/paint-studio" className="wg-about-cta-btn">
                Explore WallGlow
                <ArrowUpRight size={19} />
              </Link>
            </div>

            <div className="wg-about-cta-art">
              <div className="wg-about-art-circle wg-about-art-circle-one" />
              <div className="wg-about-art-circle wg-about-art-circle-two" />

              <div className="wg-about-art-icon">
                <Paintbrush size={68} strokeWidth={1.2} />
              </div>
            </div>

          </div>
        </div>
      </section>

    </main>
    <Footer/>
    </>
  );
};

export default About;
