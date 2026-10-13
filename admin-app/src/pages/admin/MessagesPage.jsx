import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MessageSquare, RefreshCw, SendHorizonal, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Textarea } from '../../components/ui/input.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Avatar, AvatarFallback } from '../../components/ui/misc.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { LoadingBlock } from '../../components/ui/feedback.jsx';
import { messageService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useAuth } from '../../hooks/useAuth.js';
import { formatDateTime, formatRelative, initials } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';

/** Admin inbox: one conversation per library. */
export default function AdminMessagesPage() {
  const { user } = useAuth();
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef(null);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['messages', 'conversations'],
    queryFn: () => messageService.conversations({ limit: 50 }),
    refetchInterval: 60_000,
  });

  const conversations = data?.data || [];

  useEffect(() => {
    if (!activeId && conversations.length) setActiveId(conversations[0].id);
  }, [conversations, activeId]);

  const { data: thread, isLoading: threadLoading } = useQuery({
    queryKey: ['messages', 'thread', activeId],
    queryFn: () => messageService.thread(activeId, { limit: 100 }),
    enabled: Boolean(activeId),
  });

  const messages = thread?.data?.messages || [];
  const active = conversations.find((row) => row.id === activeId);

  const sendMutation = useApiMutation({
    mutationFn: (body) => messageService.send({ conversationId: activeId, body }),
    invalidate: ['messages', 'unread-count'],
    onSuccess: () => { setDraft(''); refetch(); },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  const totalUnread = conversations.reduce((sum, row) => sum + (row.unreadForAdmin || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Conversations with library owners — renewal reminders, support and feature requests."
        actions={
          <Button variant="outline" onClick={() => refetch()} loading={isFetching}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Inbox
              {totalUnread ? <Badge tone="warning">{totalUnread} unread</Badge> : null}
            </CardTitle>
            <CardDescription>{conversations.length} conversation(s)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5 pt-0">
            {isLoading ? (
              <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-16 rounded-lg" />)}</div>
            ) : conversations.length === 0 ? (
              <EmptyState compact illustration="notifications" title="No conversations yet" description="Libraries will appear here once they message you." />
            ) : (
              conversations.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setActiveId(row.id)}
                  aria-current={row.id === activeId ? 'true' : undefined}
                  className={cn(
                    'w-full rounded-lg border p-3 text-left transition-colors',
                    row.id === activeId ? 'border-primary/40 bg-primary-soft' : 'border-transparent hover:bg-muted/60'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{row.libraryName || row.subject || 'Library'}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{row.lastMessagePreview || 'No messages yet'}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[0.65rem] text-muted-foreground">{formatRelative(row.lastMessageAt)}</p>
                      {row.unreadForAdmin ? <Badge tone="warning" size="sm">{row.unreadForAdmin}</Badge> : null}
                    </div>
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="flex min-h-[560px] flex-col">
          <CardHeader className="border-b border-border">
            <CardTitle>{active?.libraryName || 'Select a conversation'}</CardTitle>
            <CardDescription>
              {active ? (
                <>
                  {active.ownerName ? `${active.ownerName} · ` : ''}
                  {active.city ? `${active.city} · ` : ''}
                  {active.libraryId ? <Link to={`/admin/libraries/${active.libraryId}`} className="text-primary hover:underline">Open library</Link> : null}
                </>
              ) : 'Choose a library on the left to read and reply'}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col gap-4 pt-5">
            {!activeId ? (
              <EmptyState illustration="notifications" title="No conversation selected" description="Pick a library from the inbox to see the full thread." />
            ) : threadLoading ? (
              <LoadingBlock label="Loading thread…" />
            ) : (
              <div className="flex-1 space-y-4 overflow-y-auto pr-1" style={{ maxHeight: '46vh' }}>
                {messages.length === 0 ? (
                  <p className="py-10 text-center text-sm text-muted-foreground">No messages in this thread yet.</p>
                ) : (
                  messages.map((message) => {
                    const isAdminMessage = message.senderRole === 'admin' || message.senderId === user?.id;
                    return (
                      <div key={message.id} className={cn('flex gap-3', isAdminMessage ? 'flex-row-reverse' : 'flex-row')}>
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-[11px]">{initials(message.senderName || 'User')}</AvatarFallback>
                        </Avatar>
                        <div className={cn('max-w-[78%] space-y-1', isAdminMessage ? 'items-end text-right' : '')}>
                          <div className={cn('rounded-2xl px-3.5 py-2.5 text-sm', isAdminMessage ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground')}>
                            {message.body}
                          </div>
                          <p className="text-[0.68rem] text-muted-foreground">
                            {isAdminMessage ? 'You' : message.senderName || 'Librarian'} · {formatDateTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>
            )}

            <form
              className="flex items-end gap-2 border-t border-border pt-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!draft.trim() || !activeId) return;
                sendMutation.mutate(draft.trim());
              }}
            >
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    if (draft.trim() && activeId) sendMutation.mutate(draft.trim());
                  }
                }}
                rows={2}
                placeholder="Reply to this library… (Enter to send)"
                aria-label="Reply"
                className="min-h-[54px] flex-1 resize-none"
                disabled={!activeId}
              />
              <Button type="submit" loading={sendMutation.isPending} disabled={!draft.trim() || !activeId}>
                <SendHorizonal className="h-4 w-4" /> Send
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex items-start gap-3 p-5">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          <p className="text-xs text-muted-foreground">
            Conversations are stored per library, so you always have a written record of what was agreed about subscriptions,
            payments and support requests.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
