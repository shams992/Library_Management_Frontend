import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/index.js';
import { tokenStore } from '../services/api.js';

export const AuthContext = createContext(null);

const STORAGE_KEY = 'libradesk.session';

const readSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Session state for every portal (admin / librarian / student / employee).
 * The token is the source of truth for API calls; the cached user + library
 * objects only make the first paint instant — `me` always re-validates them.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readSession());
  const [booting, setBooting] = useState(true);
  const queryClient = useQueryClient();

  const persist = useCallback((next) => {
    setSession(next);
    tokenStore.set(next?.token || null);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore private-mode storage errors */ }
  }, []);

  const signOut = useCallback(
    ({ silent = false } = {}) => {
      if (!silent) authService.logout().catch(() => {});
      persist(null);
      queryClient.clear();
    },
    [persist, queryClient]
  );

  // Re-hydrate on boot: refresh user + library + subscription from the API.
  useEffect(() => {
    let cancelled = false;
    const boot = async () => {
      const token = tokenStore.get();
      if (!token) {
        if (!cancelled) setBooting(false);
        return;
      }
      try {
        const { data } = await authService.me();
        if (!cancelled) persist({ ...(readSession() || {}), token, user: data.user, library: data.library });
      } catch {
        if (!cancelled) persist(null);
      } finally {
        if (!cancelled) setBooting(false);
      }
    };
    boot();
    return () => { cancelled = true; };
  }, [persist]);

  // Global 401 handler (token expired mid-session).
  useEffect(() => {
    const onUnauthorized = () => signOut({ silent: true });
    window.addEventListener('libradesk:unauthorized', onUnauthorized);
    return () => window.removeEventListener('libradesk:unauthorized', onUnauthorized);
  }, [signOut]);

  const signIn = useCallback(
    async ({ email, password }) => {
      const { data } = await authService.adminLogin({ email, password });
      persist({ token: data.token, refreshToken: data.refreshToken, user: data.user, library: data.library, signedInAt: Date.now() });
      return data;
    },
    [persist]
  );

  const refreshSession = useCallback(async () => {
    try {
      const { data } = await authService.me();
      const current = readSession();
      persist({ ...(current || {}), token: tokenStore.get(), user: data.user, library: data.library });
      return data;
    } catch {
      return null;
    }
  }, [persist]);

  const value = useMemo(
    () => ({
      user: session?.user || null,
      library: session?.library || null,
      token: session?.token || null,
      isAuthenticated: Boolean(session?.token && session?.user),
      role: session?.user?.role || null,
      booting,
      signIn,
      signOut,
      refreshSession,
      setLibrary: (library) => persist({ ...(readSession() || {}), library }),
    }),
    [session, booting, signIn, signOut, refreshSession, persist]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
