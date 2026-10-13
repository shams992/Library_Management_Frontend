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
    <Button variant="ghost" size="icon" asChild className={cn('relative h-9 w-9', className)}>
      <Link to={to} aria-label={unread ? `${unread} unread notifications` : 'Notifications'}>
        <Bell className="h-[1.05rem] w-[1.05rem]" />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
            {unread > 99 ? '99+' : unread}
          </span>
        ) : null}
      </Link>
    </Button>
  );
};
