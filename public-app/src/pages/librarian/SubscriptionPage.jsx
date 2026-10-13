import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, BadgeCheck, CalendarDays, CheckCircle2, Clock, CreditCard,
  MessageSquare, Receipt, Send, Sparkles, Wallet,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Alert, LoadingBlock } from '../../components/ui/feedback.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table.jsx';
import { Progress } from '../../components/ui/misc.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { StatusBadge } from '../../components/ui/status-badge.jsx';
import { BillingPaymentInfo, OFFICIAL_BILLING_INFO } from '../../components/common/BillingPaymentInfo.jsx';
import { VerificationStepper, VerificationStatusBadge } from '../../components/common/VerificationWorkflow.jsx';
import { SubmitPaymentDialog } from '../../components/common/SubmitPaymentDialog.jsx';
import { WhatsAppIcon } from '../../components/common/WhatsAppIcon.jsx';
import { libraryService, messageService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useCurrency, useSettings } from '../../hooks/useSettings.js';
import { daysLeftLabel, formatDate, formatMoney, periodToLabel } from '../../utils/format.js';

const PLATFORM_FEATURES_INCLUDED = [
  'Unlimited students, seats and fee records',
  'Employees, salaries and attendance',
  'Income, expense and profit reporting',
  'Student & employee self-service portals',
  'In-app notifications and platform messaging',
  'Daily data safety — nothing is deleted on suspension',
];

export default function SubscriptionPage() {
  const currency = useCurrency();
  const { subscription } = useSettings();
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['library', 'subscription'],
    queryFn: () => libraryService.mySubscription(),
  });

  const subscriptionData = data?.data?.subscription;
  const pricing = data?.data?.pricing || {};
  const payments = data?.data?.payments || [];
  const monthlyPrice = subscriptionData?.amount || pricing.priceMonthly || subscription.priceMonthly || 1000;
  const trialMonths = pricing.trialMonths ?? subscription.trialMonths ?? 1;
  const daysLeft = subscriptionData?.trialEndDate
    ? Math.max(0, Math.ceil((new Date(subscriptionData.trialEndDate).getTime() - Date.now()) / 86_400_000))
    : 0;
  const trialStart = subscriptionData?.trialStartDate ? new Date(subscriptionData.trialStartDate) : null;
  const trialEnd = subscriptionData?.trialEndDate ? new Date(subscriptionData.trialEndDate) : null;
  const totalDays = trialStart && trialEnd
    ? Math.max(1, Math.round((trialEnd.getTime() - trialStart.getTime()) / 86_400_000))
    : trialMonths * 30;

  const notifyMutation = useApiMutation({
    mutationFn: (body) => messageService.send({ conversationId: undefined, body }),
    invalidate: ['messages', 'unread-count'],
    successMessage: 'Message sent to platform administration',
  });

  const onTrial = subscriptionData?.status === 'trial';
  const accessBlocked = ['suspended', 'cancelled', 'rejected'].includes(subscriptionData?.status);
  const verificationStatus = subscriptionData?.verificationStatus || 'pending_payment';
  const submission = subscriptionData?.paymentSubmission;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription"
        description="Your plan, payment methods, verification workflow, and renewal history."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline">
              <Link to="/librarian/messages">
                <MessageSquare className="h-4 w-4" /> Message administration
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                notifyMutation.mutate(
                  'Salaam, I would like to renew the subscription for my library. Please guide me about the payment process.'
                )
              }
              loading={notifyMutation.isPending}
            >
              <CreditCard className="h-4 w-4" /> Request renewal
            </Button>
            <Button onClick={() => setShowSubmitDialog(true)} className="gap-1.5">
              <Send className="h-4 w-4" /> Submit Payment Proof
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <LoadingBlock label="Loading subscription…" className="min-h-[40vh]" />
      ) : (
        <>
          {/* Status Alerts */}
          {accessBlocked ? (
            <Alert tone="destructive" title="Your account access is currently paused">
              Reason: {subscriptionData?.suspensionReason || 'payment pending'}. Your students, seats, fees and history are all
              safe — nothing has been deleted. Make your payment below and send the receipt to WhatsApp {OFFICIAL_BILLING_INFO.whatsappNumber} to restore access instantly.
            </Alert>
          ) : verificationStatus === 'payment_submitted' || verificationStatus === 'under_review' ? (
            <Alert tone="info" title="Payment Verification Under Review">
              We received your payment submission (Ref: <strong>{submission?.reference || 'Pending'}</strong>) on{' '}
              {submission?.submittedAt ? formatDate(submission.submittedAt) : 'recently'}. Our team is verifying it. For faster
              activation, please make sure you sent the receipt screenshot to WhatsApp{' '}
              <a
                href={OFFICIAL_BILLING_INFO.whatsappUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="underline font-semibold hover:text-emerald-700 dark:hover:text-emerald-300"
              >
                {OFFICIAL_BILLING_INFO.whatsappNumber}
              </a>
              .
            </Alert>
          ) : onTrial ? (
            <Alert tone="info" title={`Free trial — ${daysLeftLabel(daysLeft)} remaining`}>
              Your {trialMonths}-month free trial ends on {formatDate(subscriptionData?.trialEndDate)}. After that the
              subscription is {formatMoney(monthlyPrice, currency)} per month.
            </Alert>
          ) : subscriptionData?.status === 'payment_due' ? (
            <Alert tone="warning" title="Payment is due">
              Please pay {formatMoney(monthlyPrice, currency)} for the current period to keep full access. Everything keeps
              working meanwhile, and no data is removed.
            </Alert>
          ) : (
            <Alert tone="success" title="Subscription active">
              Next billing date: {formatDate(subscriptionData?.nextBillingDate || subscriptionData?.currentPeriodEnd)}. Thank you for
              using the platform.
            </Alert>
          )}

          {/* 4 Summary Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardContent className="space-y-2 p-5 pt-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Current plan</p>
                  <Badge tone="info">{subscriptionData?.billingCycleMonths || pricing.billingCycleMonths || 1}-month cycle</Badge>
                </div>
                <p className="text-2xl font-semibold">{formatMoney(monthlyPrice, currency)}</p>
                <p className="text-xs text-muted-foreground">per month, after {trialMonths} month{trialMonths === 1 ? '' : 's'} free</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-2 p-5 pt-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                  <StatusBadge status={subscriptionData?.status || 'trial'} kind="library" />
                </div>
                <p className="text-2xl font-semibold capitalize">{(subscriptionData?.status || 'trial').replace('_', ' ')}</p>
                <p className="text-xs text-muted-foreground">
                  {subscriptionData?.trialEndDate ? `Trial ends ${formatDate(subscriptionData.trialEndDate)}` : 'No trial date'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-2 p-5 pt-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Verification</p>
                  <VerificationStatusBadge status={verificationStatus} />
                </div>
                <p className="text-xl font-semibold capitalize">
                  {verificationStatus.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {submission?.reference ? `Ref: ${submission.reference}` : 'Awaiting payment proof'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3 p-5 pt-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {onTrial ? 'Trial progress' : 'Current billing'}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {onTrial ? `${daysLeft} of ${totalDays} days` : `Grace: ${subscriptionData?.gracePeriodDays ?? 7}d`}
                  </span>
                </div>
                <Progress
                  value={onTrial ? Math.max(0, Math.min(100, ((totalDays - daysLeft) / totalDays) * 100)) : 100}
                />
                <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {subscriptionData?.nextPaymentDate ? `Next ${formatDate(subscriptionData.nextPaymentDate)}` : 'Billed after trial'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Verification Stepper */}
          <VerificationStepper currentStatus={verificationStatus} />

          {/* Two-Column Grid: Billing & Payment + Payment History & Support */}
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] items-start">
            <div className="space-y-6">
              {/* Official Billing & Payment Section */}
              <BillingPaymentInfo
                amountDue={monthlyPrice}
                actionLabel="Submit Payment Proof / Reference"
                onActionClick={() => setShowSubmitDialog(true)}
              />

              {/* Payment History Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-primary" /> Payment history
                  </CardTitle>
                  <CardDescription>Official subscription invoices and payments recorded by administration</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {payments.length === 0 ? (
                    <EmptyState
                      compact
                      illustration="finance"
                      title="No subscription payments yet"
                      description={
                        onTrial
                          ? `Your ${trialMonths}-month free trial is active — verified payments will appear here once billing commences.`
                          : 'Payments recorded by administration will appear here.'
                      }
                    />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice / Period</TableHead>
                          <TableHead>Paid on</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment) => (
                          <TableRow key={payment.id || payment.invoiceNumber}>
                            <TableCell className="font-medium text-xs">
                              <p className="font-semibold text-foreground">{payment.invoiceNumber}</p>
                              <p className="text-muted-foreground">
                                {payment.periodStart && payment.periodEnd
                                  ? `${formatDate(payment.periodStart)} → ${formatDate(payment.periodEnd)}`
                                  : periodToLabel(`${payment.year}-${String(payment.month).padStart(2, '0')}`)}
                              </p>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{formatDate(payment.paidAt)}</TableCell>
                            <TableCell className="text-sm capitalize">{payment.method?.replace('_', ' ') || '—'}</TableCell>
                            <TableCell className="text-right font-medium">{formatMoney(payment.amount, currency)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
              {/* Submit Proof Card */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Send className="h-4 w-4 text-primary" /> Made a payment?
                  </CardTitle>
                  <CardDescription>
                    Submit your transaction ID or receipt so the administration team can verify and extend your subscription.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={() => setShowSubmitDialog(true)} className="w-full gap-2">
                    <CreditCard className="h-4 w-4" /> Submit Payment Proof
                  </Button>
                  <Button asChild variant="outline" className="w-full gap-2 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10">
                    <a href={OFFICIAL_BILLING_INFO.whatsappUrl} target="_blank" rel="noreferrer noopener">
                      <WhatsAppIcon className="h-4 w-4" /> Send Receipt on WhatsApp
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* What your subscription includes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" /> What your subscription includes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {PLATFORM_FEATURES_INCLUDED.map((item) => (
                    <p key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {item}
                    </p>
                  ))}
                </CardContent>
              </Card>

              {/* How renewal works */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-primary" /> How renewal works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span>Pay {formatMoney(monthlyPrice, currency)} to our official account (Shams Ud Din via SadaPay, NayaPay, or Easypaisa).</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span>Send your receipt screenshot to WhatsApp <strong>03158750992</strong>.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span>Administration verifies the payment and activates your account immediately.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                    <span>Data safety guarantee: your library data is never deleted, even if payment is delayed.</span>
                  </p>
                  <Button asChild variant="outline" size="sm" className="w-full mt-2">
                    <Link to="/librarian/messages">
                      <MessageSquare className="h-4 w-4" /> Open a conversation
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Submission Dialog */}
          <SubmitPaymentDialog
            open={showSubmitDialog}
            onClose={() => setShowSubmitDialog(false)}
            defaultAmount={monthlyPrice}
            onDone={() => refetch()}
          />
        </>
      )}
    </div>
  );
}
