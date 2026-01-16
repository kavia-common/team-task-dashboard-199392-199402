import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

function navClass({ isActive }) {
  return `kv-navItem ${isActive ? "kv-navItemActive" : ""}`;
}

// PUBLIC_INTERFACE
export function AppLayout() {
  /** Main authenticated app shell: top nav, sidebar, and content area. */
  const auth = useAuthContext();
  const navigate = useNavigate();

  return (
    <div className="kv-appShell">
      <div className="kv-topNav">
        <div className="kv-brand" role="banner" aria-label="Task dashboard">
          <span>TaskDash</span>
          <span className="kv-badge">Modern</span>
        </div>

        <div className="kv-topNavRight">
          <button
            type="button"
            className="kv-btn"
            onClick={() => navigate("/notifications")}
          >
            Notifications
          </button>
          <span className="kv-pill" title={auth.user?.email || ""}>
            {auth.user?.email || "Signed in"}
          </span>
          <button
            type="button"
            className="kv-btn"
            onClick={() => {
              auth.logout();
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="kv-layout">
        <aside className="kv-sidebar" aria-label="Primary navigation">
          <div className="kv-navGroupTitle">Workspace</div>
          <NavLink className={navClass} to="/boards">
            Boards
          </NavLink>
          <NavLink className={navClass} to="/tasks">
            Tasks
          </NavLink>

          <div className="kv-navGroupTitle">Organization</div>
          <NavLink className={navClass} to="/teams">
            Teams
          </NavLink>
          <NavLink className={navClass} to="/analytics">
            Analytics
          </NavLink>

          <div className="kv-navGroupTitle">Account</div>
          <NavLink className={navClass} to="/notifications">
            Notifications
          </NavLink>
        </aside>

        <main className="kv-main" aria-label="Main content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
