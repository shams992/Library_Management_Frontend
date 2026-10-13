import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export const useRole = () => useContext(AuthContext)?.role || null;
