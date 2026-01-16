import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";

// PUBLIC_INTERFACE
export function RegisterPage() {
  /** Registration screen for creating an account. */
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await register({ email, password });
      setSuccess("Account created. You can now sign in.");
      setTimeout(() => navigate("/login"), 700);
    } catch (err) {
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className="kv-card">
      <div className="kv-cardBody">
        <h1 className="kv-title">Create account</h1>
        <p className="kv-subtitle">Get started with your first team and board.</p>

        {error ? (
          <div className="kv-alert kv-alertError" role="alert">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="kv-alert kv-alertSuccess" role="status">
            {success}
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
                autoComplete="new-password"
                minLength={8}
                required
              />
              <div className="kv-help">Minimum 8 characters.</div>
            </div>
          </div>

          <div className="kv-footerRow">
            <div className="kv-muted">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
            <button type="submit" className="kv-btn kv-btnPrimary">
              Create account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
