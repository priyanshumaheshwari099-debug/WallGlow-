
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserRound,
  ChevronDown,
  LayoutDashboard,
  Palette,
  Settings,
  LogOut,
  LogIn,
} from "lucide-react";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase";
import "./Profile.css";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export default function UserProfile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(getStoredUser);
  const [open, setOpen] = useState(false);
  const [googlePhoto, setGooglePhoto] = useState("");
  const [imageError, setImageError] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // UPDATE PROFILE AFTER LOGIN / SIGNUP
  useEffect(() => {
    const updateUser = () => {
      setUser(getStoredUser());
      setImageError(false);
    };

    window.addEventListener("profileUpdated", updateUser);
    window.addEventListener("googleLogin", updateUser);
    window.addEventListener("storage", updateUser);

    return () => {
      window.removeEventListener("profileUpdated", updateUser);
      window.removeEventListener("googleLogin", updateUser);
      window.removeEventListener("storage", updateUser);
    };
  }, []);

  // GOOGLE PROFILE PHOTO
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setGooglePhoto(firebaseUser?.photoURL || "");
      setImageError(false);
    });

    return () => unsubscribe();
  }, []);

  const accountName =
    user?.name?.trim() ||
    user?.email ||
    "Your Space";

  const initial = accountName.charAt(0).toUpperCase();

  const profilePhoto = user
    ? user.profileImage ||
      (user.authProvider === "google" ? googlePhoto : "")
    : "";

  useEffect(() => {
    setImageError(false);
  }, [profilePhoto]);

  // LOGOUT
  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await signOut(auth);

      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("googleUser");

      setUser(null);
      setGooglePhoto("");
      setImageError(false);
      setOpen(false);

      window.dispatchEvent(new Event("profileUpdated"));

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  // AVATAR
  const renderAvatar = (size = 19) => {
    if (user && profilePhoto && !imageError) {
      return (
        <img
          src={profilePhoto}
          alt={`${accountName}'s profile`}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
        />
      );
    }

    if (user) {
      return <span>{initial}</span>;
    }

    return <UserRound size={size} />;
  };

  return (
    <div className="wg-profile">
      {/* PROFILE BUTTON */}
      <button
        type="button"
        className="wg-profile-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="wg-profile-avatar">
          {renderAvatar(19)}
        </span>

        <span className="wg-profile-trigger-text">
          <span className="wg-profile-caption">
            {user ? "YOUR SPACE" : "WELCOME TO"}
          </span>

          <span className="wg-profile-name">
            {accountName}
          </span>
        </span>

        <ChevronDown
          size={16}
          className={
            open
              ? "wg-profile-chevron active"
              : "wg-profile-chevron"
          }
        />
      </button>

      {/* DROPDOWN */}
      {open && (
        <>
          <button
            type="button"
            className="wg-profile-backdrop"
            aria-label="Close profile menu"
            onClick={() => setOpen(false)}
          />

          <div className="wg-profile-dropdown">
            {/* USER INFORMATION */}
            <div className="wg-profile-dropdown-head">
              <span className="wg-profile-dropdown-avatar">
                {renderAvatar(20)}
              </span>

              <div className="wg-profile-user-info">
                <strong>{accountName}</strong>

                <span>
                  {user?.email ||
                    "Sign in to save your designs"}
                </span>
              </div>
            </div>

            {/* MENU */}
            <div className="wg-profile-menu">
              {user ? (
                <>
                  {/* DASHBOARD */}
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                  >
                    <LayoutDashboard size={17} />
                    <span>Dashboard</span>
                  </Link>

                  {/* SAVED DESIGNS */}
                  <Link
                    to="/dashboard/my-designs"
                    onClick={() => setOpen(false)}
                  >
                    <Palette size={17} />
                    <span>Saved Designs</span>
                  </Link>

                  {/* PROFILE */}
                  <Link
                    to="/dashboard/profile"
                    onClick={() => setOpen(false)}
                  >
                    <Settings size={17} />
                    <span>My Profile</span>
                  </Link>

                  {/* LOGOUT */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                  >
                    <LogOut size={17} />
                    <span>
                      {loggingOut
                        ? "Logging out..."
                        : "Logout"}
                    </span>
                  </button>
                </>
              ) : (
                <>
                  {/* LOGIN */}
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                  >
                    <LogIn size={17} />
                    <span>Login</span>
                  </Link>

                  {/* SIGNUP */}
                  <Link
                    to="/signup"
                    onClick={() => setOpen(false)}
                  >
                    <UserRound size={17} />
                    <span>Create Account</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
