import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import Navbar from "../../components/Navbar/Navbar";
import "./Login.css";
import Footer from "../../components/Footer/Footer";

const API = "http://localhost:5000/api/auth";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
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
const completeLogin = (data) => {
  if (!data.user || !data.token) {
    throw new Error("Authentication details were not returned.");
  }

  const user = {
    ...data.user,
    id: data.user.id || data.user._id,
  };

  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", data.token);

  console.log("TOKEN SAVED CHECK:", {
    tokenPresent: !!localStorage.getItem("token"),
    userPresent: !!localStorage.getItem("user")
  });

  window.dispatchEvent(new Event("profileUpdated"));
  navigate("/");
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    setLoading(true);

    const response = await fetch(`${API}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    // Login API response check
    console.log("LOGIN API RESPONSE:", data);
    console.log("TOKEN RECEIVED:", data.token);

    if (!response.ok) {
      throw new Error(data.message || "Login failed.");
    }

    completeLogin(data);

    // Saved token check
    console.log("SAVED TOKEN:", localStorage.getItem("token"));

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    setError(err.message || "Unable to log in.");
  } finally {
    setLoading(false);
  }
};


  const handleGoogleLogin = async () => {
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
console.log("GOOGLE LOGIN CHECK:", {
  status: response.status,
  message: data.message,
  tokenPresent: !!data.token,
  userPresent: !!data.user
}); 
      if (!response.ok) {
        throw new Error(data.message || "Google login failed.");
      }

      completeLogin(data);
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Unable to log in with Google.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="wg-auth-page wg-login-page">
        <section className="wg-auth-intro">
          <span className="wg-auth-kicker">WELCOME BACK</span>

          <h1>
            Come home
            <br />
            <span>to your colours.</span>
          </h1>

          <p>
            Pick up where you left off. Your room ideas are waiting for you.
          </p>

          <div className="wg-auth-swatches">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <p className="wg-auth-note">
            One room. Endless possibilities.
          </p>
        </section>

        <section className="wg-auth-form-side">
          <form className="wg-auth-card" onSubmit={handleSubmit}>
            <span className="wg-auth-kicker">
              YOUR PERSONAL SPACE
            </span>

            <h2>Welcome back</h2>

            <p className="wg-auth-subtitle">
              Log in to continue designing your space.
            </p>

            {error && (
              <div className="wg-auth-error" role="alert">
                {error}
              </div>
            )}

            <label htmlFor="login-email">
              Email address
            </label>

            <input
              id="login-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />

            <label htmlFor="login-password">
              Password
            </label>

            <div className="wg-auth-password">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
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
              {loading ? "Logging in..." : "Log in"}
              <span>→</span>
            </button>

            <div className="wg-auth-divider">
              <span>or continue with</span>
            </div>

            <button
              type="button"
              className="wg-google-btn"
              onClick={handleGoogleLogin}
              disabled={loading || googleLoading}
            >
              <svg viewBox="0 0 24 24" width="21" height="21">
                <path
                  fill="#4285F4"
                  d="M21.35 12.25c0-.74-.06-1.28-.2-1.85H12v3.6h5.35a4.6 4.6 0 0 1-2 3.02v2.45h3.22c1.87-1.73 2.78-4.27 2.78-7.22Z"
                />
                <path
                  fill="#34A853"
                  d="M12 21.5c2.68 0 4.93-.89 6.57-2.43l-3.22-2.45c-.89.59-2.02.94-3.35.94-2.57 0-4.75-1.73-5.53-4.06H3.16v2.52A9.92 9.92 0 0 0 12 21.5Z"
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
              New to WallGlow?{" "}
              <Link to="/signup">Create an account</Link>
            </p>
          </form>
        </section>
      </main>
      <Footer/>
    </>
  );
}