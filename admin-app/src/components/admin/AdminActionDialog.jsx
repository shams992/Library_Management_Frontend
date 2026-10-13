import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle, CheckCircle2, Clock, CreditCard, ShieldOff, CalendarPlus, XCircle, FileCheck2 } from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { Input, Textarea } from '../ui/input.jsx';
import { Field } from '../ui/label.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';
import { Alert } from '../ui/feedback.jsx';
import { libraryService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { PAYMENT_METHODS } from '../../utils/constants.js';
import { formatMoney, formatDate } from '../../utils/format.js';
import { VERIFICATION_STEPS, VerificationStatusBadge } from '../common/VerificationWorkflow.jsx';

const baseSchema = {
  note: z.string().trim().max(300).optional(),
  reason: z.string().trim().max(500).optional(),
};

const SCHEMAS = {
  approve: z.object({
    trialMonths: z.coerce.number().int().min(0).max(12),
    note: baseSchema.note,
  }),
  reject: z.object({
    reason: z.string().trim().min(3, 'Please give the owner a reason').max(500),
  }),
  suspend: z.object({
    reason: z.string().trim().min(3, 'Please record why access is being suspended').max(500),
  }),
  activate: z.object({
    note: baseSchema.note,
  }),
  extend: z.object({
    months: z.coerce.number().int().min(0).max(36),
    days: z.coerce.number().int().min(0).max(365),
    note: baseSchema.note,
  }),
  recordPayment: z.object({
    amount: z.coerce.number().min(1, 'Enter the amount received').max(10000000),
    months: z.coerce.number().int().min(1).max(36),
    method: z.enum(['sadapay', 'nayapay', 'easypaisa', 'cash', 'bank_transfer', 'jazzcash', 'card', 'other']),
    reference: z.string().trim().max(120).optional(),
    paidAt: z.string().optional(),
    note: baseSchema.note,
  }),
  verifyPayment: z.object({
    status: z.enum(['pending_payment', 'payment_submitted', 'under_review', 'approved', 'active']),
    reviewNote: baseSchema.note,
    autoActivate: z.boolean().optional(),
  }),
  markPaymentDue: z.object({
    reason: baseSchema.reason,
  }),
};

const TITLES = {
  approve: { title: 'Approve library', description: 'The library becomes active and its free trial starts immediately.', icon: CheckCircle2, confirm: 'Approve & start trial', variant: 'success' },
  reject: { title: 'Reject application', description: 'The owner is notified with your reason. They can contact you to re-apply.', icon: XCircle, confirm: 'Reject application', variant: 'destructive' },
  suspend: { title: 'Suspend access', description: 'Access is blocked until payment — all data is preserved and comes back instantly.', icon: ShieldOff, confirm: 'Suspend access', variant: 'destructive' },
  activate: { title: 'Restore access', description: 'Full access returns for this library, with all of its data intact.', icon: CheckCircle2, confirm: 'Restore access', variant: 'success' },
  extend: { title: 'Extend subscription', description: 'Give extra time (for a delayed payment, a promise, or goodwill).', icon: CalendarPlus, confirm: 'Extend subscription', variant: 'default' },
  recordPayment: { title: 'Record subscription payment', description: 'Records money received by the platform and moves the next payment date.', icon: CreditCard, confirm: 'Record payment', variant: 'default' },
  verifyPayment: { title: 'Verify subscription payment', description: 'Review submitted payment proof and update the verification workflow status.', icon: FileCheck2, confirm: 'Update verification status', variant: 'default' },
  markPaymentDue: { title: 'Mark payment as due', description: 'Flags the library as needing payment without blocking access yet.', icon: AlertTriangle, confirm: 'Mark payment due', variant: 'default' },
};

/**
 * One dialog for every platform-admin lifecycle action, with the correct fields
 * and a consequence note per action.
 */
export const AdminActionDialog = ({ action, onClose, onDone }) => {
  const currency = useCurrency();
  const type = action?.type;
  const library = action?.library;
  const meta = TITLES[type] || TITLES.activate;

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm({
    resolver: zodResolver(SCHEMAS[type] || SCHEMAS.activate),
    defaultValues: {},
  });

  useEffect(() => {
    if (!action) return;
    reset({
      trialMonths: 1,
      months: type === 'recordPayment' ? 1 : 1,
      days: 0,
      method: 'sadapay',
      amount: library?.subscription?.paymentSubmission?.amount || library?.subscription?.amount || 1000,
      paidAt: new Date().toISOString().slice(0, 10),
      note: '',
      reason: '',
      reference: library?.subscription?.paymentSubmission?.reference || '',
      status: library?.subscription?.verificationStatus || 'under_review',
      reviewNote: library?.subscription?.paymentSubmission?.reviewNote || '',
      autoActivate: true,
    });
  }, [action, type, library, reset]);

  const mutation = useApiMutation({
    mutationFn: (values) => {
      const id = library.id;
      if (type === 'verifyPayment') {
        return libraryService.adminUpdateVerificationStatus(id, {
          status: values.status,
          reviewNote: values.reviewNote || '',
          autoActivate: values.autoActivate ?? false,
        });
      }
      const payload = { ...values };
      delete payload.reason; // 'reason' only travels for reject/suspend
      if (type === 'reject' || type === 'suspend') payload.reason = values.reason;
      return libraryService[type](id, payload);
    },
    invalidate: ['libraries', 'admin', 'settings'],
    successMessage: (response) => response?.message || `${meta.confirm} done`,
    onSuccess: () => { onClose(); onDone?.(); },
  });

  if (!action) return null;

  const Icon = meta.icon;

  return (
    <Dialog open={Boolean(action)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <DialogTitle>{meta.title}</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{library?.name}</span> — {meta.description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate className="space-y-4">
          {type === 'approve' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Free trial" htmlFor="adm-trial" hint="Months of free access before billing">
                <Input id="adm-trial" type="number" min={0} max={12} {...register('trialMonths')} />
              </Field>
              <Field label="Internal note" htmlFor="adm-note">
                <Input id="adm-note" {...register('note')} placeholder="Optional" />
              </Field>
            </div>
          ) : null}

          {type === 'recordPayment' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Amount received" htmlFor="adm-amount" required error={errors.amount?.message} hint={`Agreed monthly amount is ${formatMoney(library?.subscription?.amount || 0, currency)}.`}>
                <Input id="adm-amount" type="number" min={1} {...register('amount')} error={errors.amount} />
              </Field>
              <Field label="Covers months" htmlFor="adm-months" hint="Months of access this payment buys">
                <Input id="adm-months" type="number" min={1} max={36} {...register('months')} />
              </Field>
              <Field label="Method" htmlFor="adm-method">
                <Controller
                  control={control}
                  name="method"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="adm-method"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field label="Paid on" htmlFor="adm-paid">
                <Input id="adm-paid" type="date" {...register('paidAt')} />
              </Field>
              <Field label="Reference / receipt no." htmlFor="adm-ref" className="sm:col-span-2">
                <Input id="adm-ref" {...register('reference')} placeholder="Optional" />
              </Field>
            </div>
          ) : null}

          {type === 'extend' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Extra months" htmlFor="adm-ext-months">
                <Input id="adm-ext-months" type="number" min={0} max={36} {...register('months')} />
              </Field>
              <Field label="Extra days" htmlFor="adm-ext-days">
                <Input id="adm-ext-days" type="number" min={0} max={365} {...register('days')} />
              </Field>
            </div>
          ) : null}

          {type === 'reject' ? (
            <Field label="Reason (shared with the owner)" htmlFor="adm-reason" required error={errors.reason?.message}>
              <Textarea id="adm-reason" rows={3} {...register('reason')} error={errors.reason} placeholder="e.g. Incomplete address, duplicate application" />
            </Field>
          ) : null}

          {type === 'suspend' ? (
            <Field label="Reason for suspension" htmlFor="adm-suspend-reason" required error={errors.reason?.message}>
              <Textarea id="adm-suspend-reason" rows={3} {...register('reason')} error={errors.reason} placeholder="e.g. Subscription unpaid for 2 months" />
            </Field>
          ) : null}

          {type === 'verifyPayment' ? (
            <div className="space-y-4">
              {library?.subscription?.paymentSubmission ? (
                <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="font-semibold text-foreground text-sm">Submitted Payment Details</span>
                    <VerificationStatusBadge status={library.subscription.verificationStatus || 'payment_submitted'} />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 pt-1 text-muted-foreground">
                    <div>
                      <span className="block font-medium text-foreground">Amount</span>
                      <span className="font-semibold text-foreground">{formatMoney(library.subscription.paymentSubmission.amount || 0, currency)}</span>
                    </div>
                    <div>
                      <span className="block font-medium text-foreground">Payment Method</span>
                      <span className="font-medium capitalize text-foreground">{library.subscription.paymentSubmission.method}</span>
                    </div>
                    <div>
                      <span className="block font-medium text-foreground">Transaction ID / Ref</span>
                      <span className="font-mono font-medium text-foreground">{library.subscription.paymentSubmission.reference || '—'}</span>
                    </div>
                    <div>
                      <span className="block font-medium text-foreground">Sender Account / Name</span>
                      <span className="font-medium text-foreground">{library.subscription.paymentSubmission.senderAccount || library.subscription.paymentSubmission.senderName || '—'}</span>
                    </div>
                    {library.subscription.paymentSubmission.submittedAt ? (
                      <div className="col-span-2">
                        <span className="block font-medium text-foreground">Submitted On</span>
                        <span>{formatDate(library.subscription.paymentSubmission.submittedAt)}</span>
                      </div>
                    ) : null}
                    {library.subscription.paymentSubmission.notes ? (
                      <div className="col-span-2">
                        <span className="block font-medium text-foreground">Librarian Note</span>
                        <span className="italic text-foreground">{library.subscription.paymentSubmission.notes}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <Alert tone="info">
                  No librarian payment submission recorded yet. You can still update the verification workflow state manually.
                </Alert>
              )}

              <Field label="Verification workflow stage" htmlFor="adm-ver-status">
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="adm-ver-status"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {VERIFICATION_STEPS.map((step) => (
                          <SelectItem key={step.id} value={step.id}>
                            {step.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field label="Review remarks / note" htmlFor="adm-review-note" error={errors.reviewNote?.message} hint="Saved in history and sent in notification to librarian">
                <Input id="adm-review-note" {...register('reviewNote')} placeholder="e.g. Verified on SadaPay account. Subscription activated." />
              </Field>

              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer pt-1">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  {...register('autoActivate')}
                />
                <span>Automatically activate subscription when setting status to Approved</span>
              </label>
            </div>
          ) : null}

          {type === 'markPaymentDue' ? (
            <Field label="Note" htmlFor="adm-due-reason" error={errors.reason?.message}>
              <Input id="adm-due-reason" {...register('reason')} placeholder="Optional note for the audit trail" />
            </Field>
          ) : null}

          {['extend', 'activate', 'markPaymentDue'].includes(type) ? (
            <Field label="Note" htmlFor="adm-generic-note" error={errors.note?.message}>
              <Input id="adm-generic-note" {...register('note')} placeholder="Optional, kept in the audit trail" />
            </Field>
          ) : null}

          {type === 'suspend' ? (
            <Alert tone="warning" icon title="Data is never deleted">
              The library’s students, seats, fees, salaries and history stay exactly as they are. Access resumes the moment you
              restore it — this is the platform’s core safety guarantee.
            </Alert>
          ) : null}

          {mutation.isError ? <Alert tone="destructive">{mutation.error.message}</Alert> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant={meta.variant} loading={mutation.isPending}>
              <Icon className="h-4 w-4" /> {meta.confirm}
            </Button>
          </DialogFooter>
        </form>

        {type === 'extend' ? (
          <p className="text-xs text-muted-foreground">
            Current status: {library?.subscription?.status || library?.status}
            {library?.subscription?.nextPaymentDate ? ` · next payment ${new Date(library.subscription.nextPaymentDate).toLocaleDateString('en-PK')}` : ''}
          </p>
        ) : null}
        <span className="sr-only" aria-live="polite">{watch('months')}</span>
      </DialogContent>
    </Dialog>
  );
};
