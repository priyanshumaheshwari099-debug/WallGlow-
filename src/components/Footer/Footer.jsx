
import React from "react";
import { Link } from "react-router-dom";

import {
  Palette,
  ArrowUpRight,
  Heart,
  ArrowUp,
  Paintbrush,
  Bookmark,
  Mail,
} from "lucide-react";

import {
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
} from "react-icons/fa";

import "./Footer.css";

const Footer = () => {
  const year = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="wg-footer">
      <div className="wg-footer-container">

        {/* TOP SECTION */}

        <div className="wg-footer-top">

          {/* BRAND SECTION */}

          <div className="wg-footer-brand-section">

            <Link to="/" className="wg-footer-logo">
              <span className="wg-footer-logo-icon">
                <Palette size={25} />
              </span>

              <span>
                WallGlow
                <span className="wg-footer-logo-dot">.</span>
              </span>
            </Link>

            <h2>
              Your space deserves
              <br />
              <em>a little magic.</em>
            </h2>

            <p>
              Explore beautiful colours, visualize your dream
              walls, and transform every corner into a space
              that feels uniquely yours.
            </p>

            {/* SOCIAL MEDIA */}

            <div className="wg-footer-socials">

              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <FaInstagram size={18} />
              </a>

              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn size={18} />
              </a>

              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <FaGithub size={18} />
              </a>

            </div>
          </div>

          {/* FOOTER LINKS */}

          <div className="wg-footer-links-area">

            {/* EXPLORE */}

            <div className="wg-footer-column">
              <h3>Explore</h3>

              <Link to="/">Home</Link>

              <Link to="/paint-studio">
                Paint Visualizer
              </Link>

              <Link to="/colors">
                Colour Library
              </Link>

              <Link to="/saved-designs">
                My Designs
              </Link>
            </div>

            {/* ACCOUNT */}

            <div className="wg-footer-column">
              <h3>Your Account</h3>

              <Link to="/login">
                Login
              </Link>

              <Link to="/signup">
                Create Account
              </Link>

              <Link to="/settings">
                Settings
              </Link>
            </div>

            {/* INSPIRATION */}

            <div className="wg-footer-column">
              <h3>Get Inspired</h3>

              <Link to="/paint-studio">
                <Paintbrush size={15} />
                Start Designing
              </Link>

              <Link to="/saved-designs">
                <Bookmark size={15} />
                Saved Ideas
              </Link>

              <a href="mailto:hello@wallglow.example">
                <Mail size={15} />
                Contact Us
              </a>
            </div>

          </div>
        </div>

        {/* CALL TO ACTION SECTION */}

        <div className="wg-footer-banner">

          <div className="wg-footer-banner-content">

            <span className="wg-footer-banner-label">
              YOUR NEXT CREATIVE STEP
            </span>

            <h3>
              Ready to reimagine your walls?
            </h3>

            <p>
              Discover colours that bring your vision to life.
            </p>

          </div>

          <Link
            to="/paint-studio"
            className="wg-footer-cta"
          >
            Start Creating
            <ArrowUpRight size={18} />
          </Link>

        </div>

        {/* BOTTOM SECTION */}

        <div className="wg-footer-bottom">

          <p>
            © {year} WallGlow. All rights reserved.
          </p>

          <p className="wg-footer-made">
            Made with
            <Heart size={14} fill="currentColor" />
            for beautiful spaces
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="wg-footer-top-btn"
          >
            Back to top
            <ArrowUp size={16} />
          </button>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
