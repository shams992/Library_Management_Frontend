import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Bell, BellRing, Check, CheckCheck, Info, PartyPopper, Receipt, Trash2, Wallet,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { Pagination } from '../../components/ui/pagination.jsx';
import { LoadingBlock } from '../../components/ui/feedback.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { notificationService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { formatDateTime } from '../../utils/format.js';

const SEVERITY = {
  info: { icon: Info, tone: 'text-info', bg: 'bg-info/12' },
  success: { icon: PartyPopper, tone: 'text-success', bg: 'bg-success/12' },
  warning: { icon: AlertTriangle, tone: 'text-warning', bg: 'bg-warning/12' },
  error: { icon: AlertTriangle, tone: 'text-destructive', bg: 'bg-destructive/12' },
};

const TYPE_ICONS = { fee: Receipt, payment: Wallet, student: BellRing, system: Bell };

/** Notification centre — shared by librarian, admin, student and employee portals. */
export default function NotificationsPage() {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications', { filter, page }],
    queryFn: () => notificationService.list({ filter, page, limit: 20 }),
    keepPreviousData: true,
  });

  const notifications = data?.data || [];
  const meta = data?.meta;

  const markRead = useApiMutation({
    mutationFn: (id) => notificationService.markRead(id),
    invalidate: ['notifications', 'notifications', 'unread-count'],
    onSuccess: () => refetch(),
  });

  const markAll = useApiMutation({
    mutationFn: () => notificationService.markAllRead(),
    invalidate: ['notifications', 'unread-count'],
    successMessage: 'All notifications marked as read',
    onSuccess: () => refetch(),
  });

  const remove = useApiMutation({
    mutationFn: (id) => notificationService.remove(id),
    invalidate: ['notifications', 'unread-count'],
    successMessage: 'Notification removed',
    onSuccess: () => refetch(),
  });

  const unread = meta?.unread ?? notifications.filter((row) => !row.isRead).length;

  const grouped = useMemo(() => {
    const today = new Date().toDateString();
    const groups = { Today: [], Earlier: [] };
    notifications.forEach((row) => {
      const key = new Date(row.createdAt).toDateString() === today ? 'Today' : 'Earlier';
      groups[key].push(row);
    });
    return groups;
  }, [notifications]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Fee reminders, payment confirmations, subscription alerts and platform announcements."
        actions={
          <>
            <Select value={filter} onValueChange={(value) => { setFilter(value); setPage(1); }}>
              <SelectTrigger className="w-[160px]" aria-label="Filter notifications"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All notifications</SelectItem>
                <SelectItem value="unread">Unread only</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => markAll.mutate()} loading={markAll.isPending} disabled={!unread}>
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              Inbox
              {unread ? <Badge tone="warning">{unread} unread</Badge> : null}
            </CardTitle>
            <CardDescription>{meta?.total ?? notifications.length} notification(s) in total</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>Refresh</Button>
        </CardHeader>

        <CardContent className="pt-0">
          {isLoading ? (
            <LoadingBlock label="Loading notifications…" />
          ) : notifications.length === 0 ? (
            <EmptyState
              illustration="notifications"
              title={filter === 'unread' ? 'Nothing unread — you are all caught up' : 'No notifications yet'}
              description="Fee reminders, payment confirmations and subscription alerts will appear here as they happen."
              action={filter === 'unread' ? <Button variant="outline" onClick={() => setFilter('all')}>View all notifications</Button> : null}
            />
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([label, rows]) =>
                rows.length ? (
                  <section key={label}>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</h3>
                    <ul className="divide-y divide-border">
                      {rows.map((row) => {
                        const severity = SEVERITY[row.severity] || SEVERITY.info;
                        const Icon = TYPE_ICONS[row.type] || severity.icon;
                        return (
                          <li key={row.id} className={`flex items-start gap-3.5 py-3.5 ${row.isRead ? '' : 'bg-primary-soft/25 -mx-2 rounded-lg px-2'}`}>
                            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${severity.bg} ${severity.tone}`}>
                              <Icon className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className={`text-sm ${row.isRead ? 'font-medium' : 'font-semibold'}`}>{row.title}</p>
                                {!row.isRead ? <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-label="Unread" /> : null}
                              </div>
                              <p className="mt-0.5 text-sm text-muted-foreground">{row.message}</p>
                              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                <span>{formatDateTime(row.createdAt)}</span>
                                {row.link ? (
                                  <Link to={row.link} className="font-medium text-primary hover:underline">Open</Link>
                                ) : null}
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                              {!row.isRead ? (
                                <Button size="icon-sm" variant="ghost" aria-label="Mark as read" onClick={() => markRead.mutate(row.id)}>
                                  <Check className="h-3.5 w-3.5" />
                                </Button>
                              ) : null}
                              <Button size="icon-sm" variant="ghost" aria-label="Delete notification" onClick={() => remove.mutate(row.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ) : null
              )}
            </div>
          )}

          {notifications.length ? <Pagination meta={meta} entity="notifications" onPageChange={setPage} /> : null}
        </CardContent>
      </Card>
    </div>
  );
}
