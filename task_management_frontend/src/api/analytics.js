import { apiRequest } from "./client";

// PUBLIC_INTERFACE
export async function getTeamAnalytics({ token, teamId }) {
  /** Fetch team analytics via GET /analytics/teams/{team_id}. */
  return apiRequest({
    path: `/analytics/teams/${teamId}`,
    method: "GET",
    token
  });
}

// PUBLIC_INTERFACE
export async function getProjectAnalytics({ token, projectId }) {
  /** Fetch project analytics via GET /analytics/projects/{project_id}. */
  return apiRequest({
    path: `/analytics/projects/${projectId}`,
    method: "GET",
    token
  });
}
