import React, { useState } from "react";
import { getProjectAnalytics, getTeamAnalytics } from "../api/analytics";
import { useAuthContext } from "../context/AuthContext";

function Bar({ label, value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginTop: 10 }}>
      <div className="kv-row">
        <div className="kv-muted" style={{ width: 140 }}>
          {label}
        </div>
        <div className="kv-pill">{value}</div>
        <div className="kv-muted">{pct}%</div>
      </div>
      <div
        style={{
          height: 10,
          borderRadius: 999,
          border: "1px solid var(--border)",
          background: "#fff",
          overflow: "hidden",
          marginTop: 6
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "linear-gradient(90deg, var(--primary), var(--success))"
          }}
        />
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
export function AnalyticsPage() {
  /** Analytics rollups page (team + project). */
  const auth = useAuthContext();

  const [teamId, setTeamId] = useState("");
  const [projectId, setProjectId] = useState("");

  const [teamData, setTeamData] = useState(null);
  const [projectData, setProjectData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const loadTeam = async () => {
    if (!teamId) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await getTeamAnalytics({ token: auth.token, teamId });
      setTeamData(res);
    } catch (e) {
      setErr(e.message || "Failed to load team analytics");
    } finally {
      setLoading(false);
    }
  };

  const loadProject = async () => {
    if (!projectId) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await getProjectAnalytics({ token: auth.token, projectId });
      setProjectData(res);
    } catch (e) {
      setErr(e.message || "Failed to load project analytics");
    } finally {
      setLoading(false);
    }
  };

  const maxProject = projectData
    ? Math.max(
        projectData.total_tasks,
        projectData.open_tasks,
        projectData.in_progress_tasks,
        projectData.done_tasks
      )
    : 0;

  return (
    <div className="kv-card">
      <div className="kv-cardBody">
        <div className="kv-rowWrap">
          <div>
            <h1 className="kv-title">Analytics</h1>
            <p className="kv-subtitle">Rollups for teams and projects.</p>
          </div>
        </div>

        {err ? (
          <div className="kv-alert kv-alertError" role="alert" style={{ marginTop: 12 }}>
            {err}
          </div>
        ) : null}

        <div className="kv-rowWrap" style={{ marginTop: 12 }}>
          <div className="kv-card" style={{ flex: "1 1 420px" }}>
            <div className="kv-cardBody">
              <div className="kv-rowWrap">
                <div style={{ flex: "1 1 280px" }}>
                  <div className="kv-field">
                    <label className="kv-label" htmlFor="teamId">
                      Team ID (UUID)
                    </label>
                    <input
                      id="teamId"
                      className="kv-input"
                      value={teamId}
                      onChange={(e) => setTeamId(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ alignSelf: "end" }}>
                  <button
                    type="button"
                    className="kv-btn kv-btnPrimary"
                    onClick={loadTeam}
                    disabled={!teamId || loading}
                  >
                    Load team
                  </button>
                </div>
              </div>

              {teamData ? (
                <div style={{ marginTop: 12 }}>
                  <div className="kv-rowWrap">
                    <span className="kv-pill">projects: {teamData.total_projects}</span>
                    <span className="kv-pill">tasks: {teamData.total_tasks}</span>
                    <span className="kv-pill">done: {teamData.done_tasks}</span>
                  </div>
                  <div className="kv-help" style={{ marginTop: 10 }}>
                    Updated: {String(teamData.updated_at || "")}
                  </div>
                </div>
              ) : (
                <div className="kv-muted" style={{ marginTop: 10 }}>
                  Provide a team UUID to fetch rollups.
                </div>
              )}
            </div>
          </div>

          <div className="kv-card" style={{ flex: "1 1 420px" }}>
            <div className="kv-cardBody">
              <div className="kv-rowWrap">
                <div style={{ flex: "1 1 280px" }}>
                  <div className="kv-field">
                    <label className="kv-label" htmlFor="projectId">
                      Project ID (UUID)
                    </label>
                    <input
                      id="projectId"
                      className="kv-input"
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ alignSelf: "end" }}>
                  <button
                    type="button"
                    className="kv-btn kv-btnPrimary"
                    onClick={loadProject}
                    disabled={!projectId || loading}
                  >
                    Load project
                  </button>
                </div>
              </div>

              {projectData ? (
                <div style={{ marginTop: 12 }}>
                  <Bar label="Total" value={projectData.total_tasks} max={maxProject} />
                  <Bar label="Open" value={projectData.open_tasks} max={maxProject} />
                  <Bar
                    label="In progress"
                    value={projectData.in_progress_tasks}
                    max={maxProject}
                  />
                  <Bar label="Done" value={projectData.done_tasks} max={maxProject} />
                  <div className="kv-help" style={{ marginTop: 10 }}>
                    Updated: {String(projectData.updated_at || "")}
                  </div>
                </div>
              ) : (
                <div className="kv-muted" style={{ marginTop: 10 }}>
                  Provide a project UUID to fetch rollups.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
