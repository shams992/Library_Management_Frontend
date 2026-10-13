import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, RefreshCw, SendHorizonal, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Textarea } from '../../components/ui/input.jsx';
import { Avatar, AvatarFallback } from '../../components/ui/misc.jsx';
import { Alert, LoadingBlock } from '../../components/ui/feedback.jsx';
import { messageService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useAuth } from '../../hooks/useAuth.js';
import { formatDateTime, initials } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';

/**
 * Direct line to platform administration. One thread per library keeps the
 * conversation simple — historical messages are always preserved.
 */
export default function MessagesPage() {
  const { user } = useAuth();
  const [draft, setDraft] = useState('');
  const bottomRef = useRef(null);

  const { data: mine, isLoading: mineLoading } = useQuery({
    queryKey: ['messages', 'mine'],
    queryFn: () => messageService.mine(),
  });

  const conversationId = mine?.data?.conversation?.id;

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['messages', 'thread', conversationId],
    queryFn: () => messageService.thread(conversationId, { limit: 100 }),
    enabled: Boolean(conversationId),
  });

  const messages = data?.data?.messages || [];

  const sendMutation = useApiMutation({
    mutationFn: (body) => messageService.send({ conversationId, body }),
    invalidate: ['messages', 'unread-count'],
    onSuccess: () => { setDraft(''); refetch(); },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Talk directly to platform administration about your subscription, billing or anything platform-related."
        actions={
          <Button variant="outline" onClick={() => refetch()} loading={isFetching}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="flex min-h-[560px] flex-col">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" /> Platform support
            </CardTitle>
            <CardDescription>
              {mine?.data?.conversation?.subject || 'Your conversation with the platform team'}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col gap-4 pt-5">
            {mineLoading || isLoading ? (
              <LoadingBlock label="Loading conversation…" />
            ) : (
              <div className="flex-1 space-y-4 overflow-y-auto pr-1" style={{ maxHeight: '46vh' }}>
                {messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                      <MessageSquare className="h-5 w-5" />
                    </span>
                    <p className="text-sm font-medium">No messages yet</p>
                    <p className="max-w-sm text-sm text-muted-foreground">
                      Ask about your subscription, a payment you made, or request a feature — we usually reply within a working day.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMine = message.senderId === user?.id || message.mine;
                    return (
                      <div key={message.id} className={cn('flex gap-3', isMine ? 'flex-row-reverse' : 'flex-row')}>
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-[11px]">{initials(message.senderName || (isMine ? user?.name : 'Admin'))}</AvatarFallback>
                        </Avatar>
                        <div className={cn('max-w-[78%] space-y-1', isMine ? 'items-end text-right' : '')}>
                          <div
                            className={cn(
                              'rounded-2xl px-3.5 py-2.5 text-sm',
                              isMine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                            )}
                          >
                            {message.body}
                          </div>
                          <p className="text-[0.68rem] text-muted-foreground">
                            {isMine ? 'You' : message.senderName || 'Platform admin'} · {formatDateTime(message.createdAt)}
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
                if (!draft.trim() || !conversationId) return;
                sendMutation.mutate(draft.trim());
              }}
            >
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    if (draft.trim() && conversationId) sendMutation.mutate(draft.trim());
                  }
                }}
                rows={2}
                placeholder="Write a message… (Enter to send, Shift+Enter for a new line)"
                aria-label="Message"
                className="min-h-[54px] flex-1 resize-none"
              />
              <Button type="submit" loading={sendMutation.isPending} disabled={!draft.trim() || !conversationId}>
                <SendHorizonal className="h-4 w-4" /> Send
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">What we can help with</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• Subscription renewals, trial extensions and payment confirmations.</p>
              <p>• Questions about a feature or how something is calculated.</p>
              <p>• Account issues, access problems and data exports.</p>
              <p>• Feature requests — we build what libraries actually need.</p>
            </CardContent>
          </Card>

          <Alert tone="info" icon title="Your data is safe">
            Only platform administration can see this thread. Your student and fee data is never shared.
          </Alert>

          <Card>
            <CardContent className="flex items-start gap-3 p-5">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-success" />
              <p className="text-xs text-muted-foreground">
                Messages are kept with your library record so you always have a complete history of what was agreed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
