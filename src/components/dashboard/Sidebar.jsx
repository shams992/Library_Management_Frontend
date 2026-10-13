import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { ChevronDown, ChevronLeft, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { Logo } from '../common/Logo.jsx';
import { Button } from '../ui/button.jsx';
import { Badge } from '../ui/badge.jsx';
import { cn } from '../../utils/cn.js';

const NavIcon = ({ name, className }) => {
  const Icon = Icons[name] || Icons.Circle;
  return <Icon className={cn('h-[1.05rem] w-[1.05rem] shrink-0', className)} aria-hidden="true" />;
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
          className={cn('sidebar-link w-full justify-between', childActive && 'text-sidebar-foreground')}
        >
          <span className="flex items-center gap-3">
            <NavIcon name={item.icon} />
            {item.label}
          </span>
          <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', open && 'rotate-180')} />
        </button>
        {open ? (
          <ul className="mt-1 space-y-0.5 border-l border-sidebar-border pl-3 ml-[1.35rem]">
            {item.children.map((child) => (
              <li key={child.to}>
                <NavLink
                  to={child.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-md px-3 py-1.5 text-[13px] text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground',
                      isActive && location.search && child.to.includes(location.search) && 'bg-sidebar-accent text-sidebar-foreground font-medium',
                      isActive && !child.to.includes('?') && !location.search && 'bg-sidebar-accent text-sidebar-foreground font-medium'
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
        className={({ isActive }) => cn('sidebar-link', isActive && 'sidebar-link-active', collapsed && 'justify-center px-2')}
      >
        <NavIcon name={item.icon} />
        {!collapsed ? <span className="truncate">{item.label}</span> : null}
        {!collapsed && item.badge ? <Badge tone="destructive" size="sm" className="ml-auto">{item.badge}</Badge> : null}
      </NavLink>
    </li>
  );
};

/**
 * Dashboard sidebar — collapsible on desktop, slide-over on mobile.
 * Entity-agnostic: the same component serves librarian, admin and portal shells.
 */
export const Sidebar = ({
  nav = [],
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onMobileClose,
  footer,
  portalLabel,
  className,
}) => {
  const content = (
    <>
      <div className={cn('flex h-16 items-center border-b border-sidebar-border px-4', collapsed ? 'justify-center' : 'justify-between')}>
        {collapsed ? (
          <Link to="/" aria-label="LibraDesk home">
            <Icons.BookOpenCheck className="h-7 w-7 text-primary" />
          </Link>
        ) : (
          <Logo to="/" />
        )}
        <div className="flex items-center gap-1">
          {onToggleCollapse ? (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden lg:inline-flex"
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          ) : null}
          <Button variant="ghost" size="icon-sm" onClick={onMobileClose} aria-label="Close navigation" className="lg:hidden">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!collapsed && portalLabel ? (
        <p className="px-4 pt-4 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{portalLabel}</p>
      ) : null}

      <nav aria-label="Dashboard navigation" className="flex-1 overflow-y-auto px-2.5 py-4">
        <ul className="space-y-1">
          {nav.map((item) => (
            <NavGroup key={item.label} item={item} collapsed={collapsed} onNavigate={onMobileClose} />
          ))}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        {footer}
        {!collapsed ? (
          <p className="pt-3 text-center text-[0.68rem] text-muted-foreground">
            LibraDesk · v1.0
          </p>
        ) : null}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 lg:flex',
          collapsed ? 'w-[76px]' : 'w-[264px]',
          className
        )}
      >
        {content}
      </aside>

      {/* Mobile */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]" onClick={onMobileClose} aria-hidden="true" />
          <aside className="absolute left-0 top-0 flex h-full w-[280px] flex-col border-r border-sidebar-border bg-sidebar shadow-lg animate-slide-in-right">
            {content}
          </aside>
        </div>
      ) : null}
    </>
  );
};

export { NavIcon, ChevronLeft };
