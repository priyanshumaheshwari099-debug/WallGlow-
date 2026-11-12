import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import Navbar from "../../components/Navbar/Navbar";
import "./Signup.css";

const API = "https://wallglow-backend.onrender.com/api/auth";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((old) => ({
      ...old,
      [e.target.name]: e.target.value,
    }));
  };

  const completeSignup = (data) => {
    if (!data.user || !data.token) {
      throw new Error("Authentication details were not returned.");
    }

    const user = {
      ...data.user,
      id: data.user.id || data.user._id,
    };

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", data.token);

    window.dispatchEvent(new Event("profileUpdated"));
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Account creation failed.");
      }

      completeSignup(data);
    } catch (err) {
      setError(err.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");

    try {
      setGoogleLoading(true);

      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const response = await fetch(`${API}/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Google signup failed.");
      }

      completeSignup(data);
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Unable to sign up with Google.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="wg-auth-page">
        <section className="wg-auth-intro">
          <span className="wg-auth-kicker">
            A NEW SHADE OF HOME
          </span>

          <h1>
            Your walls.
            <br />
            <span>Your imagination.</span>
          </h1>

          <p>
            Create your free account and start exploring colours
            for your space.
          </p>

          <div className="wg-auth-swatches">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <p className="wg-auth-note">
            Find the colour that feels like you.
          </p>
        </section>

        <section className="wg-auth-form-side">
          <form className="wg-auth-card" onSubmit={handleSubmit}>
            <span className="wg-auth-kicker">
              GET STARTED
            </span>

            <h2>Create your account</h2>

            <p className="wg-auth-subtitle">
              Save your ideas and design your dream room.
            </p>

            {error && (
              <div className="wg-auth-error" role="alert">
                {error}
              </div>
            )}

            <label htmlFor="signup-name">
              Full name
            </label>

            <input
              id="signup-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              autoComplete="name"
              required
            />

            <label htmlFor="signup-email">
              Email address
            </label>

            <input
              id="signup-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />

            <label htmlFor="signup-password">
              Password
            </label>

            <div className="wg-auth-password">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button
              className="wg-auth-submit"
              type="submit"
              disabled={loading || googleLoading}
            >
              {loading ? "Creating account..." : "Create account"}
              <span>→</span>
            </button>

            <div className="wg-auth-divider">
              <span>or continue with</span>
            </div>

            <button
              type="button"
              className="wg-google-btn"
              onClick={handleGoogleSignup}
              disabled={loading || googleLoading}
            >
              <svg viewBox="0 0 24 24" width="21" height="21">
                <path
                  fill="#4285F4"
                  d="M21.35 12.25c0-.74-.06-1.28-.2-1.85H12v3.6h5.35a4.6 4.6 0 0 1-2 3.02v2.45h3.22c1.87-1.73 2.78-4.27 2.78-7.22Z"
                />
                <path
                  fill="#34A853"
                  d="M12 21.5c2.68 0 4.93-.89 6.57-2.43l-3.22-2.45c-.89.59-.2-2.02.94-3.35.94-2.57 0-4.75-1.73-5.53-4.06H3.16v2.52A9.92 9.92 0 0 0 12 21.5Z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.47 13c-.2-.59-.31-1.22-.31-1.88s.11-1.29.31-1.88V6.72H3.16a9.95 9.95 0 0 0 0 8.8L6.47 13Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.18c1.46 0 2.77.5 3.8 1.5l2.85-2.85A9.47 9.47 0 0 0 12 1.5a9.92 9.92 0 0 0-8.84 5.22l3.31 2.52C7.25 6.91 9.43 5.18 12 5.18Z"
                />
              </svg>

              <span>
                {googleLoading
                  ? "Connecting to Google..."
                  : "Continue with Google"}
              </span>
            </button>

            <p className="wg-auth-switch">
              Already have an account?{" "}
              <Link to="/login">Log in</Link>
            </p>
          </form>
        </section>
      </main>
    </>
  );
}