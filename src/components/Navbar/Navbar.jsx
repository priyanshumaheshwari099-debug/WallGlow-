
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Search,
  Palette,
  Sparkles,
  House,
  Paintbrush,
  Heart,
  Bookmark,
} from "lucide-react";
import Profile from "../Profile/Profile";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: "Home", path: "/", icon: House },
    { name: "Visualizer", path: "/paint-studio", icon: Paintbrush },
    { name: "Favorites", path: "/favorites", icon: Heart },
    { name: "About", path: "/about-wall-glow", icon: Bookmark },
  ];

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  const closeMenus = () => setMenuOpen(false);

  const handleSearch = (e) => {
    e.preventDefault();

    if (search.trim()) {
      navigate(`/colors?search=${encodeURIComponent(search.trim())}`);
      setMenuOpen(false);
    }
  };

  return (
    <header className="wg-navbar">
      <div className="wg-navbar-inner">
        <Link to="/" className="wg-brand" onClick={closeMenus}>
          <span className="wg-brand-icon">
            <Palette size={23} />
            <span className="wg-brand-dot"></span>
          </span>

          <span className="wg-brand-text">
            <span className="wg-brand-name">WallGlow</span>
            <span className="wg-brand-tagline">COLOR YOUR WORLD</span>
          </span>
        </Link>

        <nav className="wg-nav-links">
          {navLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`wg-nav-link ${
                  isActive(item.path) ? "wg-nav-active" : ""
                }`}
              >
                <Icon size={16} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="wg-nav-actions">
          <Profile />

          <button
            type="button"
            className="wg-mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="wg-mobile-panel">
          <div className="wg-mobile-welcome">
            <div className="wg-mobile-welcome-icon">
              <Sparkles size={20} />
            </div>
            <div>
              <h3>A little color goes a long way.</h3>
              <p>Find the shade that feels like home.</p>
            </div>
          </div>

          <form className="wg-mobile-search" onSubmit={handleSearch}>
            <Search size={18} />
            <input
              type="search"
              placeholder="Search colors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search colors"
            />
          </form>

          <nav className="wg-mobile-links">
            {navLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMenus}
                  className={`wg-mobile-link ${
                    isActive(item.path) ? "wg-mobile-active" : ""
                  }`}
                >
                  <span className="wg-mobile-link-icon">
                    <Icon size={19} />
                  </span>
                  <span>{item.name}</span>
                  <span className="wg-mobile-arrow">↗</span>
                </Link>
              );
            })}
          </nav>

          <div className="wg-mobile-bottom">
            <span className="wg-mobile-bottom-dot"></span>
            <span>Designed to make your space feel special.</span>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
