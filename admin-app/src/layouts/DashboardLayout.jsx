import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar.jsx';
import { Topbar } from '../components/dashboard/Topbar.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { ADMIN_NAV } from '../utils/navigation.js';
import { cn } from '../utils/cn.js';

/**
 * Shell for the Platform Administration Console:
 * collapsible sidebar, sticky topbar with admin profile, notifications, and responsive layout.
 */
export const DashboardLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('libradesk.admin.sidebar') === 'collapsed'; } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem('libradesk.admin.sidebar', collapsed ? 'collapsed' : 'expanded'); } catch { /* ignore */ }
  }, [collapsed]);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => { setMobileOpen(false); }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen bg-transparent">
      <Sidebar
        nav={ADMIN_NAV}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        portalLabel="Platform Admin"
        footer={
          <div className={cn('flex items-center gap-3 rounded-2xl border border-white/80 bg-white/80 p-2.5 shadow-xs backdrop-blur-md transition-all hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-slate-900/80', collapsed && 'justify-center p-2')}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-500 text-sm font-bold text-white shadow-sm shadow-indigo-500/25">
              {(user?.name || 'A').slice(0, 1).toUpperCase()}
            </div>
            {!collapsed ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">{user?.name || 'Platform Admin'}</p>
                <p className="truncate text-[11px] capitalize text-slate-400 dark:text-slate-500">Super Admin</p>
              </div>
            ) : null}
            {!collapsed ? (
              <span className="text-slate-400 text-xs font-bold">›</span>
            ) : null}
          </div>
        }
      />

      <div
        className={cn(
          'flex min-h-screen min-w-0 flex-col transition-[padding] duration-300',
          collapsed ? 'lg:pl-[80px]' : 'lg:pl-[264px]'
        )}
      >
        <Topbar
          onOpenSidebar={() => setMobileOpen(true)}
          breadcrumbBase="/"
          notificationPath="/notifications"
        />
        <main className="flex-1 px-4 pb-16 pt-5 sm:px-6 sm:pt-6">
          <div className="mx-auto w-full max-w-[1400px] space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
