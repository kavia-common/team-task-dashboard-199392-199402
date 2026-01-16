import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

// PUBLIC_INTERFACE
export function LoginPage() {
  /** Login screen for JWT auth. */
  const auth = useAuthContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitError, setSubmitError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    const res = await auth.login({ email, password });
    if (res.ok) {
      navigate("/boards");
    } else {
      setSubmitError(res.error?.message || "Login failed");
    }
  };

  return (
    <div className="kv-card">
      <div className="kv-cardBody">
        <h1 className="kv-title">Sign in</h1>
        <p className="kv-subtitle">
          Use your account credentials to access your dashboards.
        </p>

        {submitError ? (
          <div className="kv-alert kv-alertError" role="alert">
            {submitError}
          </div>
        ) : null}

        <form onSubmit={onSubmit} style={{ marginTop: 12 }}>
          <div className="kv-rowWrap">
            <div className="kv-field" style={{ flex: "1 1 280px" }}>
              <label className="kv-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="kv-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="kv-field" style={{ flex: "1 1 280px" }}>
              <label className="kv-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="kv-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <div className="kv-footerRow">
            <div className="kv-muted">
              No account? <Link to="/register">Create one</Link>
            </div>
            <button type="submit" className="kv-btn kv-btnPrimary">
              Sign in
            </button>
          </div>

          <div className="kv-help" style={{ marginTop: 10 }}>
            Backend: <code>{process.env.REACT_APP_API_BASE_URL || "http://localhost:3001"}</code>
          </div>
        </form>
      </div>
    </div>
  );
}
