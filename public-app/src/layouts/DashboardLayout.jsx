import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '../components/dashboard/Sidebar.jsx';
import { Topbar } from '../components/dashboard/Topbar.jsx';
import { SubscriptionBanner } from '../components/common/SubscriptionBanner.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { PORTAL_NAV, PORTAL_ROOT } from '../utils/navigation.js';
import { libraryService, portalService } from '../services/index.js';
import { cn } from '../utils/cn.js';

const PORTAL_LABELS = {
  librarian: 'Library workspace',
  student: 'Student portal',
  employee: 'Employee portal',
};

/**
 * Shell for authenticated areas (librarian / student / employee): collapsible sidebar,
 * sticky topbar, subscription banner and scroll container.
 */
export const DashboardLayout = ({ role }) => {
  const { user, library } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('libradesk.sidebar') === 'collapsed'; } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = PORTAL_NAV[role] || [];
  const root = PORTAL_ROOT[role] || '/';

  useEffect(() => {
    try { localStorage.setItem('libradesk.sidebar', collapsed ? 'collapsed' : 'expanded'); } catch { /* ignore */ }
  }, [collapsed]);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => { setMobileOpen(false); }, [location.pathname, location.search]);

  // Librarian: keep library + subscription fresh for the banner.
  const { data: mine } = useQuery({
    queryKey: ['library', 'mine'],
    queryFn: () => libraryService.mine(),
    enabled: role === 'librarian',
    staleTime: 60_000,
  });

  const { data: portalContext } = useQuery({
    queryKey: ['portal', 'context'],
    queryFn: () => portalService.context(),
    enabled: role === 'student' || role === 'employee',
    staleTime: 120_000,
  });

  const subscriptionBanner =
    role === 'librarian' && mine?.data
      ? { library: mine.data.library, subscription: mine.data.subscription }
      : null;

  return (
    <div className="min-h-screen bg-transparent">
      <Sidebar
        nav={nav}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        portalLabel={PORTAL_LABELS[role]}
        footer={
          <div className={cn('flex items-center gap-3 rounded-2xl border border-white/80 bg-white/80 p-2.5 shadow-xs backdrop-blur-md transition-all hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-slate-900/80', collapsed && 'justify-center p-2')}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-500 text-sm font-bold text-white shadow-sm shadow-indigo-500/25">
              {(user?.name || 'N').slice(0, 1).toUpperCase()}
            </div>
            {!collapsed ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">{user?.name || 'Nasir'}</p>
                <p className="truncate text-[11px] capitalize text-slate-400 dark:text-slate-500">{role || 'Librarian'}</p>
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
          breadcrumbBase={root}
          notificationPath={`${root}/notifications`}
        />
        <main className="flex-1 px-4 pb-16 pt-5 sm:px-6 sm:pt-6">
          {subscriptionBanner?.library && subscriptionBanner.subscription && role === 'librarian' ? (
            <SubscriptionBanner
              library={{ ...subscriptionBanner.library, trialDaysLeft: mine?.data?.subscription ? undefined : undefined }}
              subscription={subscriptionBanner.subscription}
              className="mb-5 glass-card"
            />
          ) : null}
          <div className="mx-auto w-full max-w-[1400px] space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
