import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, LogOut, Menu, Settings, UserRound } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/misc.jsx';
import { Button } from '../ui/button.jsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu.jsx';
import { ThemeToggle } from '../common/ThemeToggle.jsx';
import { NotificationBell } from '../common/NotificationBell.jsx';
import { Badge } from '../ui/badge.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { initials } from '../../utils/format.js';
import { LIBRARY_STATUS_META } from '../../utils/constants.js';
import { cn } from '../../utils/cn.js';

const labelFor = (segment) =>
  ({
    librarian: 'Library',
    admin: 'Platform',
    student: 'Student',
    employee: 'Employee',
    students: 'Students',
    seats: 'Seats',
    fees: 'Fees',
    employees: 'Employees',
    salaries: 'Salaries',
    attendance: 'Attendance',
    finance: 'Finance',
    income: 'Income',
    expenses: 'Expenses',
    profit: 'Profit',
    reports: 'Reports',
    libraries: 'Libraries',
    subscriptions: 'Subscriptions',
    payments: 'Payments',
    messages: 'Messages',
    notifications: 'Notifications',
    settings: 'Settings',
    subscription: 'Subscription',
  })[segment] || segment;

export const Topbar = ({ onOpenSidebar, breadcrumbBase, notificationPath, className }) => {
  const { user, library, signOut, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const segments = location.pathname.split('/').filter(Boolean).slice(1);
  const statusMeta = library?.status ? LIBRARY_STATUS_META[library.status] : null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <header className={cn('sticky top-0 z-40 border-b border-white/70 bg-white/75 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/75', className)}>
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenSidebar} aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </Button>

        {/* Global Glass Search Bar */}
        <div className="relative hidden sm:flex items-center w-72 lg:w-96">
          <input
            type="text"
            placeholder="Search libraries, subscriptions, students..."
            className="w-full h-10 pl-9 pr-12 rounded-2xl border border-white/90 bg-white/80 backdrop-blur-md text-xs font-medium text-slate-800 shadow-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
          <svg className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <div className="absolute right-2.5 flex items-center gap-0.5 pointer-events-none">
            <kbd className="inline-flex items-center rounded border border-slate-200/80 bg-slate-50/80 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:border-slate-800 dark:bg-slate-800">
              ⌘ K
            </kbd>
          </div>
        </div>

        {/* Breadcrumb fallback */}
        <nav aria-label="Breadcrumb" className="sm:hidden flex min-w-0 items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="font-bold text-slate-800 dark:text-white truncate">Platform Control</span>
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          <ThemeToggle />
          <NotificationBell to={notificationPath} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 rounded-2xl border border-white/90 bg-white/80 p-1.5 pr-3 shadow-xs backdrop-blur-md transition-all hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-slate-900/80 dark:hover:bg-slate-850 focus-visible:ring-2 focus-visible:ring-indigo-500"
                aria-label="Account menu"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-500 text-xs font-bold text-white shadow-xs">
                  {initials(user?.name) || 'A'}
                </div>
                <div className="hidden sm:block text-left leading-none">
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {user?.name?.split(' ')[0] || 'Admin'}
                  </span>
                  <span className="block text-[10px] text-slate-400 capitalize mt-0.5">Platform</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 rotate-90 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5 shadow-xl border border-white/80 dark:border-white/10">
              <DropdownMenuLabel className="px-3 py-2">
                <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">{user?.name || 'Administrator'}</span>
                <span className="block truncate text-xs font-medium text-slate-400">{user?.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="rounded-xl">
                <Link to={`${breadcrumbBase}/settings`}>
                  <Settings className="h-4 w-4" /> Platform settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="rounded-xl text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/50">
                <LogOut className="h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
