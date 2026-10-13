import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { notificationService } from '../../services/index.js';
import { cn } from '../../utils/cn.js';

/** Live unread counter — polls the API and links into the notification centre. */
export const NotificationBell = ({ to, className }) => {
  const { data } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.unreadCount(),
    refetchInterval: 45_000,
    staleTime: 20_000,
  });

  const unread = data?.data?.unread || 0;

  return (
    <Button variant="ghost" size="icon" asChild className={cn('relative h-9 w-9 rounded-full border border-white/80 bg-white/80 backdrop-blur-md shadow-xs hover:bg-white text-slate-600 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300', className)}>
      <Link to={to} aria-label={unread ? `${unread} unread notifications` : 'Notifications'}>
        <Bell className="h-4 w-4" />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs">
            {unread > 99 ? '99+' : unread}
          </span>
        ) : null}
      </Link>
    </Button>
  );
};
