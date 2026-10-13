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
    navigate(role === 'admin' ? '/admin/login' : '/login', { replace: true });
  };

  return (
    <header className={cn('sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md', className)}>
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenSidebar} aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </Button>

        <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-sm text-muted-foreground sm:flex">
          <Link to={breadcrumbBase} className="font-medium text-foreground/80 hover:text-foreground">
            {labelFor(location.pathname.split('/')[1])}
          </Link>
          {segments.length ? <ChevronRight className="h-3.5 w-3.5" /> : null}
          {segments.map((segment, index) => (
            <span key={`${segment}-${index}`} className="flex items-center gap-1.5">
              {index > 0 ? <ChevronRight className="h-3.5 w-3.5" /> : null}
              <span className={cn('truncate', index === segments.length - 1 && 'font-medium text-foreground')}>
                {labelFor(segment)}
              </span>
            </span>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          {library && role === 'librarian' && statusMeta ? (
            <Badge tone={statusMeta.tone} dot className="hidden md:inline-flex">
              {library.name}
            </Badge>
          ) : null}

          <NotificationBell to={notificationPath} />
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Account menu"
              >
                <Avatar className="h-8 w-8">
                  {user?.avatar?.url ? <AvatarImage src={user.avatar.url} alt="" /> : null}
                  <AvatarFallback className="text-xs">{initials(user?.name)}</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:block">{user?.name?.split(' ')[0]}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <span className="block truncate text-sm font-medium normal-case text-foreground">{user?.name}</span>
                <span className="block truncate text-xs normal-case text-muted-foreground">{user?.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`${breadcrumbBase}/settings`}>
                  <Settings className="h-4 w-4" /> {role === 'librarian' ? 'Library settings' : 'Account settings'}
                </Link>
              </DropdownMenuItem>
              {role !== 'admin' ? (
                <DropdownMenuItem asChild>
                  <Link to={`${breadcrumbBase}/profile`}>
                    <UserRound className="h-4 w-4" /> My profile
                  </Link>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
