import React, { useEffect, useState } from "react";
import { addTeamMember, createTeam, getTeam, listTeams } from "../api/teams";
import { Pagination } from "../components/Pagination";
import { useAuthContext } from "../context/AuthContext";

const DEFAULT_LIMIT = 20;

// PUBLIC_INTERFACE
export function TeamsPage() {
  /** Teams management: list/create teams and manage members. */
  const auth = useAuthContext();

  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [offset, setOffset] = useState(0);

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [newTeamName, setNewTeamName] = useState("");

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [memberUserId, setMemberUserId] = useState("");
  const [memberRole, setMemberRole] = useState("member");

  const load = async (nextOffset = offset) => {
    setLoading(true);
    setErr(null);
    try {
      const res = await listTeams({
        token: auth.token,
        limit,
        offset: nextOffset
      });
      setPage(res);
      setOffset(nextOffset);
    } catch (e) {
      setErr(e.message || "Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  const loadTeamDetail = async (teamId) => {
    setErr(null);
    try {
      const detail = await getTeam({ token: auth.token, teamId });
      setSelectedTeam(detail);
    } catch (e) {
      setErr(e.message || "Failed to load team detail");
    }
  };

  useEffect(() => {
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    setLoading(true);
    setErr(null);
    try {
      await createTeam({ token: auth.token, name: newTeamName.trim() });
      setNewTeamName("");
      await load(0);
    } catch (e2) {
      setErr(e2.message || "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  const onAddMember = async (e) => {
    e.preventDefault();
    if (!selectedTeam?.id || !memberUserId.trim()) return;

    setErr(null);
    try {
      await addTeamMember({
        token: auth.token,
        teamId: selectedTeam.id,
        userId: memberUserId.trim(),
        roleInTeam: memberRole
      });
      setMemberUserId("");
      setMemberRole("member");
      await loadTeamDetail(selectedTeam.id);
    } catch (e2) {
      setErr(e2.message || "Failed to add member");
    }
  };

  return (
    <div className="kv-card">
      <div className="kv-cardBody">
        <div className="kv-rowWrap">
          <div>
            <h1 className="kv-title">Teams</h1>
            <p className="kv-subtitle">Create teams and manage membership.</p>
          </div>
          <div className="kv-spacer" />
          <button type="button" className="kv-btn" onClick={() => load(0)}>
            Refresh
          </button>
        </div>

        {err ? (
          <div className="kv-alert kv-alertError" role="alert" style={{ marginTop: 12 }}>
            {err}
          </div>
        ) : null}

        <div className="kv-rowWrap" style={{ marginTop: 12 }}>
          <form onSubmit={onCreate} style={{ flex: "1 1 420px" }}>
            <div className="kv-field">
              <label className="kv-label" htmlFor="teamName">
                New team name
              </label>
              <input
                id="teamName"
                className="kv-input"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="e.g. Product Engineering"
              />
            </div>
            <div className="kv-footerRow">
              <div className="kv-muted">Creator becomes admin.</div>
              <button
                type="submit"
                className="kv-btn kv-btnPrimary"
                disabled={!newTeamName.trim() || loading}
              >
                Create team
              </button>
            </div>
          </form>

          <div className="kv-field" style={{ flex: "0 1 180px" }}>
            <label className="kv-label" htmlFor="teamLimit">
              Page size
            </label>
            <select
              id="teamLimit"
              className="kv-select"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setOffset(0);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          {loading ? <div className="kv-muted">Loading…</div> : null}
        </div>

        {page?.items?.length ? (
          <div style={{ marginTop: 12 }}>
            <table className="kv-table" aria-label="Teams table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>ID</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {page.items.map((t) => (
                  <tr key={t.id}>
                    <td>{t.name}</td>
                    <td className="kv-muted">
                      <code>{t.id}</code>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="kv-btn kv-btnLink"
                        onClick={() => loadTeamDetail(t.id)}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="kv-footerRow">
              <Pagination
                meta={page.meta}
                onPrev={() => load(Math.max(0, offset - limit))}
                onNext={() => load(offset + limit)}
              />
              <div className="kv-muted">Select “Manage” to edit membership.</div>
            </div>
          </div>
        ) : (
          <div className="kv-alert" style={{ marginTop: 12 }}>
            No teams yet.
          </div>
        )}

        {selectedTeam ? (
          <div className="kv-card" style={{ marginTop: 16 }}>
            <div className="kv-cardHeader">
              <div className="kv-rowWrap">
                <div>
                  <h2 className="kv-title" style={{ fontSize: 18 }}>
                    {selectedTeam.name}
                  </h2>
                  <p className="kv-subtitle">
                    Team ID: <code>{selectedTeam.id}</code>
                  </p>
                </div>
                <div className="kv-spacer" />
                <button type="button" className="kv-btn" onClick={() => setSelectedTeam(null)}>
                  Close
                </button>
                <button
                  type="button"
                  className="kv-btn"
                  onClick={() => loadTeamDetail(selectedTeam.id)}
                >
                  Reload
                </button>
              </div>
            </div>

            <div className="kv-cardBody">
              <h3 className="kv-title" style={{ fontSize: 16 }}>
                Members
              </h3>

              {selectedTeam.members && selectedTeam.members.length ? (
                <div style={{ marginTop: 10 }}>
                  <table className="kv-table" aria-label="Team members table">
                    <thead>
                      <tr>
                        <th>User ID</th>
                        <th>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTeam.members.map((m) => (
                        <tr key={`${m.team_id}-${m.user_id}`}>
                          <td className="kv-muted">
                            <code>{m.user_id}</code>
                          </td>
                          <td>
                            <span className="kv-pill">{m.role_in_team}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="kv-muted" style={{ marginTop: 8 }}>
                  No members listed.
                </div>
              )}

              <form onSubmit={onAddMember} style={{ marginTop: 12 }}>
                <div className="kv-rowWrap">
                  <div className="kv-field" style={{ flex: "1 1 320px" }}>
                    <label className="kv-label" htmlFor="memberUserId">
                      Add user by ID (UUID)
                    </label>
                    <input
                      id="memberUserId"
                      className="kv-input"
                      value={memberUserId}
                      onChange={(e) => setMemberUserId(e.target.value)}
                      placeholder="User UUID"
                    />
                  </div>
                  <div className="kv-field" style={{ flex: "0 1 180px" }}>
                    <label className="kv-label" htmlFor="memberRole">
                      Role
                    </label>
                    <select
                      id="memberRole"
                      className="kv-select"
                      value={memberRole}
                      onChange={(e) => setMemberRole(e.target.value)}
                    >
                      <option value="member">member</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>
                  <div style={{ alignSelf: "end" }}>
                    <button
                      type="submit"
                      className="kv-btn kv-btnPrimary"
                      disabled={!memberUserId.trim()}
                    >
                      Add member
                    </button>
                  </div>
                </div>

                <div className="kv-help" style={{ marginTop: 8 }}>
                  Note: the backend requires requester to be a team admin.
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
