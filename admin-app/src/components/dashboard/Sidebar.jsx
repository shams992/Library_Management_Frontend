import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { BookMark } from '../common/Logo.jsx';
import { Badge } from '../ui/badge.jsx';
import { cn } from '../../utils/cn.js';

const NavIcon = ({ name, className }) => {
  const Icon = Icons[name] || Icons.Circle;
  return <Icon className={cn('h-4 w-4 shrink-0 transition-colors', className)} aria-hidden="true" />;
};

const isChildActive = (children, pathname, search) =>
  children.some((child) => {
    const [path, query] = child.to.split('?');
    if (path !== pathname) return false;
    if (!query) return true;
    return search.replace(/^\?/, '') === query;
  });

const NavGroup = ({ item, collapsed, onNavigate }) => {
  const location = useLocation();
  const childActive = item.children ? isChildActive(item.children, location.pathname, location.search) : false;
  const [open, setOpen] = useState(childActive);

  useEffect(() => {
    if (childActive) setOpen(true);
  }, [childActive]);

  if (item.children?.length && !collapsed) {
    return (
      <li>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={cn(
            'flex w-full items-center justify-between rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200',
            childActive
              ? 'bg-indigo-50/90 text-indigo-700 font-semibold shadow-xs dark:bg-indigo-950/80 dark:text-indigo-300'
              : 'text-slate-600 hover:bg-white/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100'
          )}
        >
          <span className="flex items-center gap-3">
            <NavIcon name={item.icon} className={childActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'} />
            <span className="truncate">{item.label}</span>
          </span>
          <ChevronRight className={cn('h-3.5 w-3.5 text-slate-400 transition-transform duration-200', open && 'rotate-90')} />
        </button>
        {open ? (
          <ul className="mt-1 ml-4 space-y-0.5 border-l border-slate-200/60 pl-3 dark:border-slate-800">
            {item.children.map((child) => (
              <li key={child.to}>
                <NavLink
                  to={child.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-xl px-3 py-1.5 text-[13px] font-medium transition-colors',
                      isActive
                        ? 'bg-indigo-50/70 text-indigo-700 font-semibold dark:bg-indigo-950/60 dark:text-indigo-300'
                        : 'text-slate-500 hover:bg-white/60 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                    )
                  }
                >
                  {child.label}
                </NavLink>
              </li>
            ))}
          </ul>
        ) : null}
      </li>
    );
  }

  return (
    <li>
      <NavLink
        to={item.to}
        end={item.end}
        onClick={onNavigate}
        title={collapsed ? item.label : undefined}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200',
            isActive
              ? 'bg-indigo-50/90 text-indigo-600 font-semibold shadow-xs dark:bg-indigo-950/80 dark:text-indigo-300'
              : 'text-slate-600 hover:bg-white/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100',
            collapsed && 'justify-center px-2'
          )
        }
      >
        {({ isActive }) => (
          <>
            <NavIcon
              name={item.icon}
              className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}
            />
            {!collapsed ? <span className="truncate">{item.label}</span> : null}
            {!collapsed && item.badge ? (
              <Badge tone="destructive" size="sm" className="ml-auto rounded-full px-2 text-[10px] font-bold">
                {item.badge}
              </Badge>
            ) : !collapsed && item.label === 'Notifications' ? (
              <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white shadow-xs">
                3
              </span>
            ) : null}
            {!collapsed && !item.children && !item.badge && item.label !== 'Notifications' && (
              <ChevronRight className="ml-auto h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60" />
            )}
          </>
        )}
      </NavLink>
    </li>
  );
};

export const Sidebar = ({
  nav = [],
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onMobileClose,
  footer,
  portalLabel = 'PLATFORM ADMIN',
  className,
}) => {
  const dashboardItem = nav.find((i) => i.label.toLowerCase().includes('dashboard') || i.label.toLowerCase().includes('overview'));
  const libraryItems = nav.filter((i) => !['dashboard', 'overview', 'notifications', 'messages', 'settings', 'library settings', 'profile'].includes(i.label.toLowerCase()));
  const systemItems = nav.filter((i) => ['notifications', 'messages', 'settings', 'library settings', 'subscription', 'profile'].includes(i.label.toLowerCase()));

  const content = (
    <div className="flex h-full flex-col justify-between">
      <div>
        {/* Brand Header */}
        <div className={cn('flex h-20 items-center px-5', collapsed ? 'justify-center' : 'justify-between')}>
          {!collapsed ? (
            <Link to="/" className="flex items-center gap-3 group" aria-label="LibraDesk home">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-500 shadow-md shadow-indigo-500/25 transition-transform duration-300 group-hover:scale-105">
                <BookMark className="h-6 w-6 text-white" />
              </div>
              <div className="leading-tight">
                <span className="block text-base font-black tracking-tight text-slate-900 dark:text-white">
                  LibraDesk
                </span>
                <span className="block text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  Platform Admin
                </span>
              </div>
            </Link>
          ) : (
            <Link to="/" aria-label="LibraDesk home">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-500 shadow-md shadow-indigo-500/25">
                <BookMark className="h-6 w-6 text-white" />
              </div>
            </Link>
          )}

          {/* Collapse Button */}
          <div className="flex items-center gap-1">
            {onToggleCollapse ? (
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className="hidden lg:flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-500 shadow-xs backdrop-blur-md transition-all hover:bg-slate-100 hover:text-slate-800 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <ChevronLeft className={cn('h-4 w-4 transition-transform duration-300', collapsed && 'rotate-180')} />
              </button>
            ) : null}
            <button
              type="button"
              onClick={onMobileClose}
              aria-label="Close navigation"
              className="lg:hidden flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav aria-label="Dashboard navigation" className="px-3.5 py-2">
          {dashboardItem ? (
            <ul className="space-y-1 mb-4">
              <NavGroup item={dashboardItem} collapsed={collapsed} onNavigate={onMobileClose} />
            </ul>
          ) : null}

          {!collapsed && libraryItems.length > 0 ? (
            <p className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
              {portalLabel}
            </p>
          ) : null}

          <ul className="space-y-1">
            {libraryItems.map((item) => (
              <NavGroup key={item.label} item={item} collapsed={collapsed} onNavigate={onMobileClose} />
            ))}
          </ul>

          {systemItems.length > 0 ? (
            <div className="mt-4 pt-3 border-t border-slate-200/40 dark:border-slate-800/40">
              <ul className="space-y-1">
                {systemItems.map((item) => (
                  <NavGroup key={item.label} item={item} collapsed={collapsed} onNavigate={onMobileClose} />
                ))}
              </ul>
            </div>
          ) : null}
        </nav>
      </div>

      <div className="p-3.5">
        {footer}
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden h-screen flex-col border-r border-white/70 bg-white/75 backdrop-blur-2xl transition-[width] duration-300 dark:border-white/10 dark:bg-slate-950/80 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.03)] lg:flex',
          collapsed ? 'w-[80px]' : 'w-[264px]',
          className
        )}
      >
        {content}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onMobileClose} aria-hidden="true" />
          <aside className="absolute left-0 top-0 flex h-full w-[280px] flex-col border-r border-white/70 bg-white/95 backdrop-blur-2xl shadow-2xl dark:border-white/10 dark:bg-slate-950/95 animate-slide-in-right">
            {content}
          </aside>
        </div>
      ) : null}
    </>
  );
};

export { NavIcon, ChevronLeft };

