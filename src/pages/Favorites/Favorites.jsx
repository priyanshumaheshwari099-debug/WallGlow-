
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  ArrowLeft,
  RefreshCw,
  Trash2,
  Palette,
  CalendarDays,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

import {
  getFavoriteDesigns,
  toggleFavorite,
} from "../../designApi";

import "./Favorites.css";

function Favorites() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getFavoriteDesigns();

      // Supports both { designs: [] } and direct array responses
      const favoriteList = Array.isArray(result)
        ? result
        : result.designs || [];

      setDesigns(favoriteList);
    } catch (err) {
      console.error("Favorites loading error:", err);
      setError(err.message || "Unable to load your favorites.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleRemoveFavorite = async (id) => {
    try {
      setRemovingId(id);

      await toggleFavorite(id, false);

      setDesigns((previous) =>
        previous.filter((design) => design._id !== id)
      );
    } catch (err) {
      console.error("Remove favorite error:", err);
      setError(err.message || "Unable to remove favorite.");
    } finally {
      setRemovingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Recently saved";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Recently saved";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <Navbar />

      <main className="favorites-page">
        <div className="favorites-container">

          {/* HEADER */}
          <div className="favorites-topbar">
            <Link to="/paint-studio" className="favorites-back">
              <ArrowLeft size={17} />
              Back to Paint Studio
            </Link>

            <button
              className="favorites-refresh"
              onClick={loadFavorites}
              disabled={loading}
              type="button"
            >
              <RefreshCw
                size={16}
                className={loading ? "refresh-spinning" : ""}
              />
              Refresh
            </button>
          </div>

          {/* PAGE INTRO */}
          <section className="favorites-heading">
            <div className="favorites-heading-icon">
              <Heart size={28} fill="currentColor" />
            </div>

            <div>
              <span className="favorites-eyebrow">
                YOUR PERSONAL COLLECTION
              </span>

              <h1>
                My <span>Favorites</span>
              </h1>

              <p>
                All your favorite wall shades and designs, collected in one place.
              </p>
            </div>
          </section>

          {/* STATS */}
          <section className="favorites-stats">
            <div className="favorites-stat-card">
              <div className="favorites-stat-icon">
                <Heart size={21} />
              </div>

              <div>
                <span>Total Favorites</span>
                <h3>{designs.length}</h3>
              </div>
            </div>

            <div className="favorites-stat-card">
              <div className="favorites-stat-icon">
                <Palette size={21} />
              </div>

              <div>
                <span>Saved Collection</span>
                <h3>{designs.length} Items</h3>
              </div>
            </div>
          </section>

          {/* SECTION TITLE */}
          <div className="favorites-section-heading">
            <div>
              <h2>Your Saved Collection</h2>
              <p>Explore the designs you have saved.</p>
            </div>

            <span className="favorites-count">
              {designs.length} {designs.length === 1 ? "Item" : "Items"}
            </span>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="favorites-message">
              <div className="favorites-loader"></div>
              <h3>Loading your favorites...</h3>
              <p>Please wait while we fetch your saved designs.</p>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="favorites-message favorites-error">
              <h3>Something went wrong</h3>
              <p>{error}</p>

              <button onClick={loadFavorites} type="button">
                Try Again
              </button>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && !error && designs.length === 0 && (
            <div className="favorites-empty">
              <div className="favorites-empty-icon">
                <Heart size={42} />
              </div>

              <h2>No Favorites Yet</h2>

              <p>
                You haven't saved any shades or wall designs yet.
                Explore Paint Studio and add your favorite colors here.
              </p>

              <Link to="/paint-studio" className="favorites-explore-btn">
                <Sparkles size={18} />
                Explore Paint Studio
              </Link>
            </div>
          )}

          {/* FAVORITES GRID */}
          {!loading && !error && designs.length > 0 && (
            <div className="favorites-grid">
              {designs.map((design) => {
                const image =
                  design.previewImage || design.originalImage;

                const color = design.primaryColor || "#C98F91";

                return (
                  <article
                    className="favorite-card"
                    key={design._id}
                  >
                    {/* IMAGE */}
                    <div className="favorite-image-wrapper">
                      {image ? (
                        <img
                          src={image}
                          alt={design.title || "Favorite wall design"}
                          className="favorite-image"
                        />
                      ) : (
                        <div
                          className="favorite-color-preview"
                          style={{ backgroundColor: color }}
                        >
                          <ImageIcon size={35} />
                        </div>
                      )}

                      <span className="favorite-badge">
                        <Heart size={13} fill="currentColor" />
                        Favorite
                      </span>

                      <button
                        className="favorite-remove-btn"
                        type="button"
                        title="Remove from favorites"
                        onClick={() =>
                          handleRemoveFavorite(design._id)
                        }
                        disabled={removingId === design._id}
                      >
                        {removingId === design._id ? (
                          <RefreshCw size={18} className="refresh-spinning" />
                        ) : (
                          <Heart size={19} fill="currentColor" />
                        )}
                      </button>
                    </div>

                    {/* DETAILS */}
                    <div className="favorite-card-content">
                      <div className="favorite-card-title">
                        <h3>
                          {design.title || "My Favorite Design"}
                        </h3>

                        <span className="favorite-pattern">
                          {design.pattern || "Solid"}
                        </span>
                      </div>

                      {/* COLOR INFORMATION */}
                      <div className="favorite-color-info">
                        <div
                          className="favorite-color-circle"
                          style={{ backgroundColor: color }}
                        />

                        <div>
                          <span>Primary Color</span>
                          <strong>{color.toUpperCase()}</strong>
                        </div>
                      </div>

                      {design.secondaryColor && (
                        <div className="favorite-secondary-color">
                          <span
                            className="favorite-color-circle"
                            style={{
                              backgroundColor: design.secondaryColor,
                            }}
                          />

                          <div>
                            <span>Secondary Color</span>
                            <strong>
                              {design.secondaryColor.toUpperCase()}
                            </strong>
                          </div>
                        </div>
                      )}

                      <div className="favorite-card-footer">
                        <span>
                          <CalendarDays size={15} />
                          {formatDate(
                            design.createdAt || design.updatedAt
                          )}
                        </span>

                        <span className="favorite-saved-label">
                          <Heart size={14} fill="currentColor" />
                          Saved
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}

export default Favorites;
