/**
 * Very small fetch wrapper for the FastAPI backend.
 * - Adds Authorization: Bearer <token> when available
 * - Handles JSON parsing and error mapping
 */

const DEFAULT_BASE_URL = "http://localhost:3001";

function getBaseUrl() {
  const envUrl = process.env.REACT_APP_API_BASE_URL;
  return (envUrl && envUrl.trim()) || DEFAULT_BASE_URL;
}

function buildUrl(path, query) {
  const baseUrl = getBaseUrl().replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const url = new URL(`${baseUrl}${normalizedPath}`);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

async function parseJsonSafe(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

// PUBLIC_INTERFACE
export async function apiRequest({ path, method = "GET", token, body, query }) {
  /** Performs an HTTP request to the backend API. */
  const url = buildUrl(path, query);

  const headers = {
    Accept: "application/json"
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    const data = await parseJsonSafe(res);
    const message =
      (data && (data.detail || data.message)) ||
      `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return parseJsonSafe(res);
}

// PUBLIC_INTERFACE
export function pageQuery({ limit, offset }) {
  /** Helper to build pagination query params consistently. */
  return {
    limit,
    offset
  };
}
