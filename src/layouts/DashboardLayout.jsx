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
  admin: 'Platform control',
  student: 'Student portal',
  employee: 'Employee portal',
};

/**
 * Shell for every authenticated area: collapsible sidebar, sticky topbar,
 * subscription banner and a scroll container that keeps mobile layouts native.
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
      ? { library: { ...mine.data.library, status: mine.data.library.status, trialDaysLeft: undefined }, subscription: mine.data.subscription }
      : role === 'admin'
        ? null
        : portalContext?.data?.library
          ? { library: portalContext.data.library, subscription: portalContext.data.subscription ? { status: portalContext.data.subscription.status, trialEndDate: portalContext.data.subscription.trialEndDate, nextPaymentDate: portalContext.data.subscription.nextPaymentDate } : null }
          : null;

  return (
    <div className="flex min-h-screen bg-muted/25">
      <Sidebar
        nav={nav}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        portalLabel={PORTAL_LABELS[role]}
        footer={
          <div className={cn('flex items-center gap-2.5 rounded-lg bg-muted/60 p-2', collapsed && 'justify-center')}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {(user?.name || '?').slice(0, 1).toUpperCase()}
            </div>
            {!collapsed ? (
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{user?.name}</p>
                <p className="truncate text-[0.68rem] capitalize text-muted-foreground">{role}</p>
              </div>
            ) : null}
          </div>
        }
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onOpenSidebar={() => setMobileOpen(true)}
          breadcrumbBase={root}
          notificationPath={`${root}/notifications`}
        />
        <main className="flex-1 px-4 pb-16 pt-5 sm:px-6 sm:pt-6">
          {subscriptionBanner?.library && subscriptionBanner.subscription && role !== 'admin' ? (
            <SubscriptionBanner
              library={{ ...subscriptionBanner.library, trialDaysLeft: mine?.data?.subscription ? undefined : undefined }}
              subscription={subscriptionBanner.subscription}
              className="mb-5"
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
