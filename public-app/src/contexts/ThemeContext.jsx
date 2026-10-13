import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

export const ThemeContext = createContext(null);
const STORAGE_KEY = 'libradesk.theme';

const systemPrefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;

const readStored = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => readStored() || 'system');

  const resolved = theme === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : theme;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolved === 'dark');
    root.style.colorScheme = resolved;
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* ignore */ }
  }, [theme, resolved]);

  useEffect(() => {
    if (theme !== 'system') return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setTheme('system'); // re-evaluate
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const toggle = useCallback(() => setTheme(resolved === 'dark' ? 'light' : 'dark'), [resolved]);

  const value = useMemo(() => ({ theme, resolvedTheme: resolved, setTheme, toggle }), [theme, resolved, toggle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
