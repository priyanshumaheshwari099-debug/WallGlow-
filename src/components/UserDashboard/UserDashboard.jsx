
import { useEffect, useMemo, useState } from "react";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  Paintbrush,
  Images,
  UserRound,
  Heart,
  History,
  LogOut,
  Palette,
  Menu,
  X,
  Bell,
  ArrowRight,
  MoreVertical,
  Sparkles,
  TrendingUp,
  Clock3,
  ChevronDown,
} from "lucide-react";

import "./UserDashboard.css";
import Footer from "../Footer/Footer";

const STORAGE_KEY = "wallglow_saved_designs";
const FAVORITES_KEY = "wallglow_favorites";
const HISTORY_KEY = "wallglow_design_history";

const menuItems = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    path: "/dashboard",
    end: true,
  },
  
  {
    label: "My Profile",
    icon: UserRound,
    path: "/dashboard/profile",
  },
  {
    label: "My Favorites",
    icon: Heart,
    path: "/dashboard/favorites",
  },
  
];

const palette = [
  { name: "Royal Burgundy", hex: "#5B1F3D" },
  { name: "Sage Green", hex: "#8A9A7B" },
  { name: "Warm Beige", hex: "#D9C9B3" },
  { name: "Dusty Rose", hex: "#C79BA7" },
  { name: "Muted Blue", hex: "#6B7C93" },
  { name: "Terracotta", hex: "#B5624A" },
];

const readStorage = (key) => {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const formatDate = (value) => {
  if (!value) return "Recently saved";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Recently saved"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

/* =========================
   DASHBOARD OVERVIEW
========================= */

function Overview({
  user,
  designs,
  favorites,
  history,
  search,
  navigate,
}) {
  const recentDesigns = useMemo(() => {
    return [...designs]
      .filter((design) =>
        (
          design.name ||
          design.projectName ||
          "Untitled Design"
        )
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      )
      .slice(0, 3);
  }, [designs, search]);

  const firstName = user?.name?.split(" ")[0] || "Designer";

  const stats = [
    {
      label: "Saved Designs",
      value: designs.length,
      note: "Your creative projects",
      icon: Images,
      tone: "rose",
    },
    {
      label: "Colors Used",
      value: new Set(
        designs
          .flatMap((design) =>
            Array.isArray(design.colors)
              ? design.colors.map((color) =>
                  typeof color === "string"
                    ? color
                    : color.hex || color.color
                )
              : []
          )
          .filter(Boolean)
      ).size,
      note: "In your designs",
      icon: Paintbrush,
      tone: "peach",
    },
    {
      label: "Favorite Colors",
      value: favorites.length,
      note: "Saved to favorites",
      icon: Heart,
      tone: "pink",
    },
    {
      label: "Design History",
      value: history.length,
      note: "Recorded activities",
      icon: History,
      tone: "cream",
    },
  ];

  return (
    <div className="wg-overview">
      <section className="wg-welcome">
        <div className="wg-welcome-content">
          <span className="wg-eyebrow">
            <Sparkles size={15} />
            YOUR CREATIVE WORKSPACE
          </span>

          <h1>
            Welcome back, <em>{firstName}!</em>
          </h1>

          <p>
            Visualize. Design. Transform. Make your walls
            more beautiful.
          </p>
        </div>

        <div className="wg-welcome-image" />
      </section>

      <section className="wg-stats">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              className={`wg-stat wg-${stat.tone}`}
              key={stat.label}
            >
              <div className="wg-stat-icon">
                <Icon size={25} />
              </div>

              <div>
                <strong>
                  {String(stat.value).padStart(2, "0")}
                </strong>
                <h3>{stat.label}</h3>
                <p>{stat.note}</p>
              </div>
            </div>
          );
        })}
      </section>

      <div className="wg-dashboard-columns">
        <div className="wg-left-column">
          <section className="wg-panel">
            <div className="wg-panel-heading">
              <h2>Recent Designs</h2>

              <button
                type="button"
                onClick={() =>
                  navigate("/dashboard/my-designs")
                }
              >
                View All <ArrowRight size={17} />
              </button>
            </div>

            {recentDesigns.length > 0 ? (
              <div className="wg-recent-grid">
                {recentDesigns.map((design, index) => (
                  <div
                    className="wg-design-card"
                    key={design.id || design._id || index}
                  >
                    <div className="wg-design-image">
                      {design.paintedImage || design.image ? (
                        <img
                          src={
                            design.paintedImage ||
                            design.image
                          }
                          alt={
                            design.name || "Room design"
                          }
                        />
                      ) : (
                        <div className="wg-image-placeholder">
                          <Images size={32} />
                        </div>
                      )}
                    </div>

                    <div className="wg-design-info">
                      <div>
                        <h3>
                          {design.name ||
                            design.projectName ||
                            "Untitled Design"}
                        </h3>

                        <p>
                          {formatDate(design.createdAt)}
                        </p>
                      </div>

                      <button
                        type="button"
                        aria-label="Open saved designs"
                        onClick={() =>
                          navigate("/dashboard/my-designs")
                        }
                      >
                        <MoreVertical size={19} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="wg-empty">
                <Images size={35} />

                <h3>No designs yet</h3>

                <p>
                  Your saved room transformations will appear
                  here.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/dashboard/paint-studio")
                  }
                >
                  Create Your First Design
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </section>

          <section className="wg-panel">
            <div className="wg-panel-heading">
              <h2>Recommended Colors</h2>
              <span className="wg-subtle-label">
                Explore shades
              </span>
            </div>

            <div className="wg-color-grid">
              {palette.map((color) => (
                <div
                  className="wg-color-item"
                  key={color.hex}
                >
                  <div
                    className="wg-color-swatch"
                    style={{
                      backgroundColor: color.hex,
                    }}
                  />

                  <strong>{color.name}</strong>
                  <span>{color.hex}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="wg-right-column">
          <section className="wg-panel">
            <div className="wg-panel-heading">
              <h2>Quick Actions</h2>
            </div>

            <div className="wg-actions-grid">
              {[
                {
                  label: "Open Paint Studio",
                  icon: Paintbrush,
                  path: "/dashboard/paint-studio",
                },
                {
                  label: "View My Designs",
                  icon: Images,
                  path: "/dashboard/my-designs",
                },
                {
                  label: "See Favorites",
                  icon: Heart,
                  path: "/dashboard/favorites",
                },
                {
                  label: "Design History",
                  icon: Clock3,
                  path: "/dashboard/history",
                },
              ].map((action) => {
                const Icon = action.icon;

                return (
                  <button
                    type="button"
                    className="wg-action"
                    key={action.label}
                    onClick={() => navigate(action.path)}
                  >
                    <span className="wg-action-icon">
                      <Icon size={23} />
                    </span>

                    <span>{action.label}</span>

                    <ArrowRight size={15} />
                  </button>
                );
              })}
            </div>
          </section>

          <section className="wg-panel">
            <div className="wg-panel-heading">
              <h2>Design Inspiration</h2>
            </div>

            <div className="wg-inspiration">
              <div className="wg-inspiration-overlay">
                <h3>Modern Living Room Ideas</h3>

                <p>
                  Explore beautiful wall colors and designs
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/dashboard/paint-studio")
                  }
                >
                  Start Creating <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </section>

          <div className="wg-tip">
            <TrendingUp size={21} />

            <div>
              <strong>Design Tip</strong>

              <p>
                Try different shades and compare them before
                finalizing your room.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   MAIN USER DASHBOARD
========================= */

export default function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [search] = useState("");
  const [designs, setDesigns] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const refresh = () => {
      setDesigns(readStorage(STORAGE_KEY));
      setFavorites(readStorage(FAVORITES_KEY));
      setHistory(readStorage(HISTORY_KEY));

      try {
        setUser(
          JSON.parse(localStorage.getItem("user") || "null")
        );
      } catch {
        setUser(null);
      }
    };

    refresh();

    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    navigate("/login", { replace: true });
  };

  const isOverview =
    location.pathname.replace(/\/$/, "") === "/dashboard";

  return (
    <>
      <div className="wg-dashboard-layout">
        {mobileOpen && (
          <button
            type="button"
            className="wg-mobile-overlay"
            aria-label="Close sidebar"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <aside
          className={`wg-sidebar ${
            mobileOpen ? "open" : ""
          }`}
        >
          {/* BRAND — LOGO CLICK OPENS HOME */}
          <div className="wg-sidebar-brand">
            <div className="wg-brand-icon">
              <Palette size={31} />
            </div>

            <div className="wg-sidebar-brand-text">
              <h2
                className="wallglow-logo"
                role="link"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation();
                  navigate("/", { replace: true });
                }}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault();
                    navigate("/", { replace: true });
                  }
                }}
              >
                WallGlow
              </h2>

              <p>Paint Your Imagination</p>
            </div>
          </div>

          <div className="wg-sidebar-divider" />

          <nav className="wg-sidebar-nav">
            {menuItems.map(
              ({ label, icon: Icon, path, end }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={end}
                  className={({ isActive }) =>
                    `wg-nav-item ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  <Icon size={23} strokeWidth={1.9} />
                  <span>{label}</span>
                </NavLink>
              )
            )}
          </nav>

          <div className="wg-sidebar-bottom">
            <button
              type="button"
              className="wg-logout"
              onClick={logout}
            >
              <LogOut size={22} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <div className="wg-main">
          <header className="wg-topbar">
            <div className="wg-topbar-left">
              <button
                type="button"
                className="wg-menu-toggle"
                aria-label="Toggle sidebar"
                onClick={() =>
                  setMobileOpen((previous) => !previous)
                }
              >
                {mobileOpen ? (
                  <X size={23} />
                ) : (
                  <Menu size={23} />
                )}
              </button>
            </div>

            <div className="wg-topbar-right">
              <button
                type="button"
                className="wg-notification"
                aria-label="Notifications"
              >
                <Bell size={22} />
              </button>

              <button
                type="button"
                className="wg-user-menu"
                onClick={() =>
                  navigate("/dashboard/profile")
                }
              >
                {user?.profileImage ||
                user?.photoURL ||
                user?.picture ? (
                  <img
                    src={
                      user.profileImage ||
                      user.photoURL ||
                      user.picture
                    }
                    alt="Profile"
                  />
                ) : (
                  <span className="wg-user-avatar">
                    <UserRound size={22} />
                  </span>
                )}

                <span>
                  Hi, {user?.name?.split(" ")[0] || "User"}
                </span>

                <ChevronDown size={16} />
              </button>
            </div>
          </header>

          <main
            className="wg-scroll-content"
            key={location.pathname}
          >
            {isOverview ? (
              <Overview
                user={user}
                designs={designs}
                favorites={favorites}
                history={history}
                search={search}
                navigate={navigate}
              />
            ) : (
              <Outlet />
            )}
          </main>
        </div>
      </div>

      <Footer />
    </>
  );
}
