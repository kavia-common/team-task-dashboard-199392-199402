import { apiRequest } from "./client";

// PUBLIC_INTERFACE
export async function listTeams({ token, limit, offset }) {
  /** List teams via GET /teams (paginated). */
  return apiRequest({
    path: "/teams",
    method: "GET",
    token,
    query: { limit, offset }
  });
}

// PUBLIC_INTERFACE
export async function createTeam({ token, name }) {
  /** Create team via POST /teams. */
  return apiRequest({
    path: "/teams",
    method: "POST",
    token,
    body: { name }
  });
}

// PUBLIC_INTERFACE
export async function getTeam({ token, teamId }) {
  /** Get team detail via GET /teams/{team_id}. */
  return apiRequest({
    path: `/teams/${teamId}`,
    method: "GET",
    token
  });
}

// PUBLIC_INTERFACE
export async function addTeamMember({ token, teamId, userId, roleInTeam }) {
  /** Add team member via POST /teams/{team_id}/members. */
  return apiRequest({
    path: `/teams/${teamId}/members`,
    method: "POST",
    token,
    body: { user_id: userId, role_in_team: roleInTeam || "member" }
  });
}
