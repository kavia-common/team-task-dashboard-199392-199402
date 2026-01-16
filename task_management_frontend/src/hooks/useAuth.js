import { useCallback, useEffect, useMemo, useState } from "react";
import { getMe, login as apiLogin } from "../api/auth";

const TOKEN_KEY = "tm_jwt";

// PUBLIC_INTERFACE
export function useAuth() {
  /** Manages JWT auth state and current user profile. */
  const [token, setToken] = useState(() => {
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState(null);

  const refreshMe = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const me = await getMe({ token });
      setUser(me);
    } catch (e) {
      // Token invalid or expired -> clear.
      setUser(null);
      setToken(null);
      try {
        window.localStorage.removeItem(TOKEN_KEY);
      } catch {
        // ignore
      }
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiLogin({ email, password });
      const nextToken = data.access_token;
      setToken(nextToken);
      try {
        window.localStorage.setItem(TOKEN_KEY, nextToken);
      } catch {
        // ignore
      }
      const me = await getMe({ token: nextToken });
      setUser(me);
      return { ok: true };
    } catch (e) {
      setError(e);
      return { ok: false, error: e };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      error,
      isAuthenticated: Boolean(token),
      login,
      logout,
      refreshMe
    }),
    [token, user, loading, error, login, logout, refreshMe]
  );

  return value;
}
