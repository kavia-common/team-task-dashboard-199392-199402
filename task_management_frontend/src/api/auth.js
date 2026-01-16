import { apiRequest } from "./client";

// PUBLIC_INTERFACE
export async function register({ email, password, roles }) {
  /** Register a new user via POST /auth/register. */
  return apiRequest({
    path: "/auth/register",
    method: "POST",
    body: { email, password, roles: roles && roles.length ? roles : null }
  });
}

// PUBLIC_INTERFACE
export async function login({ email, password }) {
  /** Login via POST /auth/login and obtain access_token. */
  return apiRequest({
    path: "/auth/login",
    method: "POST",
    body: { email, password }
  });
}

// PUBLIC_INTERFACE
export async function getMe({ token }) {
  /** Get current user profile via GET /auth/me. */
  return apiRequest({
    path: "/auth/me",
    method: "GET",
    token
  });
}
