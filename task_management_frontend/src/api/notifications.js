import { apiRequest } from "./client";

// PUBLIC_INTERFACE
export async function listNotifications({ token, unreadOnly, limit, offset }) {
  /** List notifications via GET /notifications with pagination. */
  return apiRequest({
    path: "/notifications",
    method: "GET",
    token,
    query: {
      unread_only: unreadOnly || false,
      limit,
      offset
    }
  });
}
