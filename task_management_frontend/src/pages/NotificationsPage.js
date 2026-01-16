import React, { useEffect, useState } from "react";
import { listNotifications } from "../api/notifications";
import { Pagination } from "../components/Pagination";
import { useAuthContext } from "../context/AuthContext";

const DEFAULT_LIMIT = 20;

// PUBLIC_INTERFACE
export function NotificationsPage() {
  /** Notifications list page. */
  const auth = useAuthContext();

  const [unreadOnly, setUnreadOnly] = useState(false);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [offset, setOffset] = useState(0);

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const load = async (nextOffset = offset) => {
    setLoading(true);
    setErr(null);
    try {
      const res = await listNotifications({
        token: auth.token,
        unreadOnly,
        limit,
        offset: nextOffset
      });
      setPage(res);
      setOffset(nextOffset);
    } catch (e) {
      setErr(e.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadOnly, limit]);

  return (
    <div className="kv-card">
      <div className="kv-cardBody">
        <div className="kv-rowWrap">
          <div>
            <h1 className="kv-title">Notifications</h1>
            <p className="kv-subtitle">Your latest activity and updates.</p>
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
          <label className="kv-row" style={{ gap: 8 }}>
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => {
                setOffset(0);
                setUnreadOnly(e.target.checked);
              }}
            />
            <span className="kv-muted">Unread only</span>
          </label>

          <div className="kv-field" style={{ flex: "0 1 160px" }}>
            <label className="kv-label" htmlFor="notifLimit">
              Page size
            </label>
            <select
              id="notifLimit"
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

          <div className="kv-help" style={{ alignSelf: "end" }}>
            Note: “mark read” endpoint is not present in the backend OpenAPI spec.
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          {loading ? <div className="kv-muted">Loading…</div> : null}
        </div>

        {page?.items?.length ? (
          <div style={{ marginTop: 12 }}>
            {page.items.map((n) => (
              <div
                key={n.id}
                className="kv-alert"
                style={{
                  marginBottom: 10,
                  borderColor: n.is_read
                    ? "var(--border)"
                    : "rgba(59,130,246,0.35)",
                  background: n.is_read ? "#fff" : "rgba(59,130,246,0.06)"
                }}
              >
                <div className="kv-rowWrap">
                  <div>
                    <div className="kv-rowWrap" style={{ gap: 8 }}>
                      <span className="kv-pill">{n.type}</span>
                      {!n.is_read ? <span className="kv-pill">unread</span> : null}
                      <span className="kv-muted" style={{ fontSize: 12 }}>
                        {String(n.created_at || "")}
                      </span>
                    </div>
                    <div style={{ marginTop: 6, fontWeight: 600 }}>{n.title}</div>
                    <div className="kv-muted" style={{ marginTop: 4 }}>
                      {n.message}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="kv-footerRow">
              <Pagination
                meta={page.meta}
                onPrev={() => load(Math.max(0, offset - limit))}
                onNext={() => load(offset + limit)}
              />
              <div className="kv-muted">Showing newest notifications first.</div>
            </div>
          </div>
        ) : (
          <div className="kv-alert" style={{ marginTop: 12 }}>
            No notifications found.
          </div>
        )}
      </div>
    </div>
  );
}
