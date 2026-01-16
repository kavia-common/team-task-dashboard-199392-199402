import React, { useEffect, useMemo, useState } from "react";
import {
  addComment,
  createTask,
  listComments,
  listTasks,
  updateTask
} from "../api/tasks";
import { Pagination } from "../components/Pagination";
import { useAuthContext } from "../context/AuthContext";

const DEFAULT_LIMIT = 20;

// PUBLIC_INTERFACE
export function TasksPage() {
  /** Tasks table with filters, pagination, and task details/comments. */
  const auth = useAuthContext();

  const [projectId, setProjectId] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [offset, setOffset] = useState(0);

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [selected, setSelected] = useState(null);
  const [selectedComments, setSelectedComments] = useState([]);
  const [commentBody, setCommentBody] = useState("");

  const [newTitle, setNewTitle] = useState("");

  const filters = useMemo(
    () => ({
      project_id: projectId || null,
      q: q || null,
      status: status || null,
      priority: priority || null
    }),
    [projectId, q, status, priority]
  );

  const load = async (nextOffset = offset) => {
    if (!projectId) {
      setPage(null);
      setSelected(null);
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const res = await listTasks({
        token: auth.token,
        filters,
        limit,
        offset: nextOffset
      });
      setPage(res);
      setOffset(nextOffset);
    } catch (e) {
      setErr(e.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (task) => {
    setSelected(task);
    setSelectedComments([]);
    setCommentBody("");
    try {
      const res = await listComments({ token: auth.token, taskId: task.id });
      setSelectedComments(res || []);
    } catch (e) {
      setErr(e.message || "Failed to load comments");
    }
  };

  useEffect(() => {
    // No auto-load: backend requires project_id or team_id; user must paste one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!projectId || !newTitle.trim()) return;
    setLoading(true);
    setErr(null);
    try {
      await createTask({
        token: auth.token,
        payload: { project_id: projectId, title: newTitle.trim() }
      });
      setNewTitle("");
      await load(0);
    } catch (e2) {
      setErr(e2.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const onUpdateSelected = async (patch) => {
    if (!selected) return;
    setErr(null);
    try {
      const updated = await updateTask({
        token: auth.token,
        taskId: selected.id,
        payload: patch
      });
      setSelected(updated);
      // Refresh list quickly (keeps pagination/filters).
      await load(offset);
    } catch (e) {
      setErr(e.message || "Failed to update task");
    }
  };

  const onAddComment = async (e) => {
    e.preventDefault();
    if (!selected || !commentBody.trim()) return;
    setErr(null);
    try {
      await addComment({
        token: auth.token,
        taskId: selected.id,
        body: commentBody.trim()
      });
      setCommentBody("");
      const res = await listComments({ token: auth.token, taskId: selected.id });
      setSelectedComments(res || []);
    } catch (e2) {
      setErr(e2.message || "Failed to add comment");
    }
  };

  return (
    <div className="kv-card">
      <div className="kv-cardBody">
        <div className="kv-rowWrap">
          <div>
            <h1 className="kv-title">Tasks</h1>
            <p className="kv-subtitle">Search, filter, and update task details.</p>
          </div>
          <div className="kv-spacer" />
          <button type="button" className="kv-btn" onClick={() => load(0)}>
            Apply / Refresh
          </button>
        </div>

        {err ? (
          <div className="kv-alert kv-alertError" role="alert" style={{ marginTop: 12 }}>
            {err}
          </div>
        ) : null}

        <div className="kv-rowWrap" style={{ marginTop: 12 }}>
          <div className="kv-field" style={{ flex: "1 1 320px" }}>
            <label className="kv-label" htmlFor="projectIdTasks">
              Project ID (UUID)
            </label>
            <input
              id="projectIdTasks"
              className="kv-input"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="Paste project UUID"
            />
          </div>

          <div className="kv-field" style={{ flex: "1 1 220px" }}>
            <label className="kv-label" htmlFor="q">
              Search
            </label>
            <input
              id="q"
              className="kv-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="title/description"
            />
          </div>

          <div className="kv-field" style={{ flex: "0 1 180px" }}>
            <label className="kv-label" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              className="kv-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Any</option>
              <option value="open">open</option>
              <option value="in_progress">in_progress</option>
              <option value="done">done</option>
            </select>
          </div>

          <div className="kv-field" style={{ flex: "0 1 180px" }}>
            <label className="kv-label" htmlFor="priority">
              Priority
            </label>
            <select
              id="priority"
              className="kv-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="">Any</option>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </div>

          <div className="kv-field" style={{ flex: "0 1 150px" }}>
            <label className="kv-label" htmlFor="limit">
              Page size
            </label>
            <select
              id="limit"
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

        <form onSubmit={onCreate} style={{ marginTop: 12 }}>
          <div className="kv-rowWrap">
            <div className="kv-field" style={{ flex: "1 1 320px" }}>
              <label className="kv-label" htmlFor="newTitle">
                New task title
              </label>
              <input
                id="newTitle"
                className="kv-input"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                disabled={!projectId || loading}
                placeholder="Create a new task for this project"
              />
            </div>
            <div style={{ alignSelf: "end" }}>
              <button
                type="submit"
                className="kv-btn kv-btnPrimary"
                disabled={!projectId || !newTitle.trim() || loading}
              >
                Create
              </button>
            </div>
          </div>
        </form>

        <div style={{ marginTop: 14 }}>
          {loading ? <div className="kv-muted">Loading…</div> : null}
        </div>

        {page?.items?.length ? (
          <div style={{ marginTop: 12 }}>
            <table className="kv-table" aria-label="Tasks table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Updated</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {page.items.map((t) => (
                  <tr key={t.id}>
                    <td>{t.title}</td>
                    <td>
                      <span className="kv-pill">{t.status}</span>
                    </td>
                    <td>
                      <span className="kv-pill">{t.priority}</span>
                    </td>
                    <td className="kv-muted">
                      {t.updated_at ? String(t.updated_at).slice(0, 10) : "—"}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="kv-btn kv-btnLink"
                        onClick={() => loadComments(t)}
                      >
                        Details
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
              <div className="kv-muted">
                Tip: click <strong>Details</strong> to edit status/priority and
                manage comments.
              </div>
            </div>
          </div>
        ) : projectId ? (
          <div className="kv-alert" style={{ marginTop: 12 }}>
            No tasks found for this query.
          </div>
        ) : (
          <div className="kv-alert" style={{ marginTop: 12 }}>
            Paste a project UUID to load tasks (backend requires <code>project_id</code>{" "}
            or <code>team_id</code>).
          </div>
        )}

        {selected ? (
          <div className="kv-card" style={{ marginTop: 16 }}>
            <div className="kv-cardHeader">
              <div className="kv-rowWrap">
                <div>
                  <h2 className="kv-title" style={{ fontSize: 18 }}>
                    {selected.title}
                  </h2>
                  <p className="kv-subtitle">
                    Task ID: <code>{selected.id}</code>
                  </p>
                </div>
                <div className="kv-spacer" />
                <button type="button" className="kv-btn" onClick={() => setSelected(null)}>
                  Close
                </button>
              </div>
            </div>

            <div className="kv-cardBody">
              <div className="kv-rowWrap">
                <div className="kv-field" style={{ flex: "0 1 220px" }}>
                  <label className="kv-label" htmlFor="selStatus">
                    Status
                  </label>
                  <select
                    id="selStatus"
                    className="kv-select"
                    value={selected.status || "open"}
                    onChange={(e) => onUpdateSelected({ status: e.target.value })}
                  >
                    <option value="open">open</option>
                    <option value="in_progress">in_progress</option>
                    <option value="done">done</option>
                  </select>
                </div>

                <div className="kv-field" style={{ flex: "0 1 220px" }}>
                  <label className="kv-label" htmlFor="selPriority">
                    Priority
                  </label>
                  <select
                    id="selPriority"
                    className="kv-select"
                    value={selected.priority || "medium"}
                    onChange={(e) => onUpdateSelected({ priority: e.target.value })}
                  >
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                  </select>
                </div>
              </div>

              <div className="kv-field" style={{ marginTop: 12 }}>
                <label className="kv-label" htmlFor="selDesc">
                  Description
                </label>
                <textarea
                  id="selDesc"
                  className="kv-textarea"
                  rows={4}
                  value={selected.description || ""}
                  onChange={(e) =>
                    setSelected((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
                <div className="kv-footerRow">
                  <div className="kv-muted">
                    Saved on blur with “Update description”
                  </div>
                  <button
                    type="button"
                    className="kv-btn kv-btnPrimary"
                    onClick={() =>
                      onUpdateSelected({
                        description: selected.description || null
                      })
                    }
                  >
                    Update description
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <h3 className="kv-title" style={{ fontSize: 16 }}>
                  Comments
                </h3>

                {selectedComments.length ? (
                  <div style={{ marginTop: 10 }}>
                    {selectedComments.map((c) => (
                      <div key={c.id} className="kv-alert" style={{ marginBottom: 8 }}>
                        <div className="kv-muted" style={{ fontSize: 12 }}>
                          {c.created_at ? String(c.created_at) : ""}{" "}
                          {c.author_user_id ? `• author ${c.author_user_id}` : ""}
                        </div>
                        <div style={{ marginTop: 6 }}>{c.body}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="kv-muted" style={{ marginTop: 8 }}>
                    No comments yet.
                  </div>
                )}

                <form onSubmit={onAddComment} style={{ marginTop: 10 }}>
                  <div className="kv-field">
                    <label className="kv-label" htmlFor="commentBody">
                      Add comment
                    </label>
                    <textarea
                      id="commentBody"
                      className="kv-textarea"
                      rows={3}
                      value={commentBody}
                      onChange={(e) => setCommentBody(e.target.value)}
                      placeholder="Write a short update…"
                    />
                  </div>
                  <div className="kv-footerRow">
                    <div className="kv-muted">Notifies assignees (backend).</div>
                    <button
                      type="submit"
                      className="kv-btn kv-btnPrimary"
                      disabled={!commentBody.trim()}
                    >
                      Post
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
