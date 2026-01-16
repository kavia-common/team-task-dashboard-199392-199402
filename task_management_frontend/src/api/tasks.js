import { apiRequest } from "./client";

// PUBLIC_INTERFACE
export async function listTasks({ token, filters, limit, offset }) {
  /** List tasks via GET /tasks with pagination and filters. */
  return apiRequest({
    path: "/tasks",
    method: "GET",
    token,
    query: {
      ...(filters || {}),
      limit,
      offset
    }
  });
}

// PUBLIC_INTERFACE
export async function createTask({ token, payload }) {
  /** Create task via POST /tasks. */
  return apiRequest({
    path: "/tasks",
    method: "POST",
    token,
    body: payload
  });
}

// PUBLIC_INTERFACE
export async function getTask({ token, taskId }) {
  /** Get task via GET /tasks/{task_id}. */
  return apiRequest({
    path: `/tasks/${taskId}`,
    method: "GET",
    token
  });
}

// PUBLIC_INTERFACE
export async function updateTask({ token, taskId, payload }) {
  /** Update task via PATCH /tasks/{task_id}. */
  return apiRequest({
    path: `/tasks/${taskId}`,
    method: "PATCH",
    token,
    body: payload
  });
}

// PUBLIC_INTERFACE
export async function listComments({ token, taskId }) {
  /** List comments via GET /tasks/{task_id}/comments. */
  return apiRequest({
    path: `/tasks/${taskId}/comments`,
    method: "GET",
    token
  });
}

// PUBLIC_INTERFACE
export async function addComment({ token, taskId, body }) {
  /** Add comment via POST /tasks/{task_id}/comments. */
  return apiRequest({
    path: `/tasks/${taskId}/comments`,
    method: "POST",
    token,
    body: { body }
  });
}
