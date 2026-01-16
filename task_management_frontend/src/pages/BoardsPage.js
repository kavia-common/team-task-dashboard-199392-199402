import React, { useEffect, useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { listTasks, updateTask, createTask } from "../api/tasks";
import { useAuthContext } from "../context/AuthContext";

const DEFAULT_COLUMNS = [
  { id: "open", title: "Open", status: "open" },
  { id: "in_progress", title: "In Progress", status: "in_progress" },
  { id: "done", title: "Done", status: "done" }
];

// PUBLIC_INTERFACE
export function BoardsPage() {
  /** Kanban boards page with drag-and-drop across status columns. */
  const auth = useAuthContext();

  // Backend requires team_id or project_id. We provide a simple "Project ID" input.
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");

  const tasksByStatus = useMemo(() => {
    const map = {
      open: [],
      in_progress: [],
      done: []
    };
    tasks.forEach((t) => {
      const key = t.status || "open";
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tasks]);

  const load = async () => {
    if (!projectId) {
      setTasks([]);
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const page = await listTasks({
        token: auth.token,
        filters: { project_id: projectId },
        limit: 200,
        offset: 0
      });
      setTasks(page.items || []);
    } catch (e) {
      setErr(e.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreateTask = async (e) => {
    e.preventDefault();
    if (!projectId || !newTitle.trim()) return;

    setLoading(true);
    setErr(null);
    try {
      const created = await createTask({
        token: auth.token,
        payload: {
          project_id: projectId,
          title: newTitle.trim(),
          status: "open",
          priority: "medium",
          assignee_user_ids: []
        }
      });
      setTasks((prev) => [created, ...prev]);
      setNewTitle("");
    } catch (e2) {
      setErr(e2.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    const fromCol = source.droppableId;
    const toCol = destination.droppableId;

    if (fromCol === toCol && destination.index === source.index) return;

    const moved = tasks.find((t) => t.id === draggableId);
    if (!moved) return;

    // Optimistic update
    const nextStatus = toCol;
    setTasks((prev) =>
      prev.map((t) => (t.id === draggableId ? { ...t, status: nextStatus } : t))
    );

    try {
      await updateTask({
        token: auth.token,
        taskId: draggableId,
        payload: { status: nextStatus }
      });
    } catch (e) {
      // revert on failure
      setTasks((prev) => prev.map((t) => (t.id === draggableId ? moved : t)));
      setErr(e.message || "Failed to move task");
    }
  };

  return (
    <div className="kv-card">
      <div className="kv-cardBody">
        <div className="kv-rowWrap">
          <div>
            <h1 className="kv-title">Kanban Board</h1>
            <p className="kv-subtitle">
              Drag tasks between columns to update status.
            </p>
          </div>
          <div className="kv-spacer" />
          <button type="button" className="kv-btn" onClick={load}>
            Refresh
          </button>
        </div>

        {err ? (
          <div className="kv-alert kv-alertError" role="alert" style={{ marginTop: 12 }}>
            {err}
          </div>
        ) : null}

        <div className="kv-rowWrap" style={{ marginTop: 12 }}>
          <div className="kv-field" style={{ flex: "1 1 340px" }}>
            <label className="kv-label" htmlFor="projectId">
              Project ID (UUID)
            </label>
            <input
              id="projectId"
              className="kv-input"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="e.g. 7b9c... (required by backend list tasks)"
            />
            <div className="kv-help">
              The backend tasks endpoints require <code>project_id</code> (or{" "}
              <code>team_id</code>). Paste a project UUID to load its tasks.
            </div>
          </div>

          <form onSubmit={onCreateTask} style={{ flex: "1 1 340px" }}>
            <div className="kv-field">
              <label className="kv-label" htmlFor="newTaskTitle">
                Quick add task
              </label>
              <input
                id="newTaskTitle"
                className="kv-input"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Task title"
                disabled={!projectId || loading}
              />
            </div>
            <div className="kv-footerRow">
              <div className="kv-muted">
                Status: <span className="kv-pill">open</span>
              </div>
              <button
                type="submit"
                className="kv-btn kv-btnPrimary"
                disabled={!projectId || !newTitle.trim() || loading}
              >
                Add
              </button>
            </div>
          </form>
        </div>

        <div style={{ marginTop: 16 }}>
          {loading ? <div className="kv-muted">Loading…</div> : null}
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="kv-kanban" style={{ marginTop: 12 }}>
            {DEFAULT_COLUMNS.map((col) => (
              <Droppable key={col.id} droppableId={col.id}>
                {(provided) => (
                  <div
                    className="kv-column"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    aria-label={`${col.title} column`}
                  >
                    <div className="kv-columnHeader">
                      <h3 className="kv-columnTitle">{col.title}</h3>
                      <span className="kv-pill">
                        {(tasksByStatus[col.status] || []).length}
                      </span>
                    </div>

                    {(tasksByStatus[col.status] || []).map((t, idx) => (
                      <Draggable key={t.id} draggableId={t.id} index={idx}>
                        {(dragProvided) => (
                          <div
                            className="kv-taskCard"
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                          >
                            <p className="kv-taskTitle">{t.title}</p>
                            <div className="kv-taskMeta">
                              <span className="kv-pill">priority: {t.priority}</span>
                              {t.due_date ? (
                                <span className="kv-pill">due: {String(t.due_date).slice(0, 10)}</span>
                              ) : null}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
