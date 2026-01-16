import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

// PUBLIC_INTERFACE
export function ProtectedRoute() {
  /** Protects nested routes; redirects to /login if unauthenticated. */
  const auth = useAuthContext();

  if (auth.loading) {
    return (
      <div className="kv-card">
        <div className="kv-cardBody">
          <div className="kv-muted">Loading…</div>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
