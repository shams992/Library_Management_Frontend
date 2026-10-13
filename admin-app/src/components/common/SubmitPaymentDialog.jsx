import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, ExternalLink, Send, ShieldCheck } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog.jsx';
import { Button } from '../ui/button.jsx';
import { Input, Textarea } from '../ui/input.jsx';
import { Field } from '../ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';
import { Alert } from '../ui/feedback.jsx';
import { libraryService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { PAYMENT_METHODS } from '../../utils/constants.js';
import { OFFICIAL_BILLING_INFO } from './BillingPaymentInfo.jsx';

const schema = z.object({
  amount: z.coerce.number().min(1, 'Please enter a valid payment amount').max(10000000),
  method: z.enum(['sadapay', 'nayapay', 'easypaisa', 'bank_transfer', 'cash', 'jazzcash', 'card', 'other']),
  reference: z.string().trim().min(3, 'Please enter your Transaction ID or Reference number').max(120),
  senderName: z.string().trim().max(120).optional(),
  senderAccount: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(500).optional(),
});

export function SubmitPaymentDialog({ open, onClose, defaultAmount = 5000, onDone }) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: defaultAmount,
      method: 'sadapay',
      reference: '',
      senderName: '',
      senderAccount: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        amount: defaultAmount || 5000,
        method: 'sadapay',
        reference: '',
        senderName: '',
        senderAccount: '',
        notes: '',
      });
    }
  }, [open, defaultAmount, reset]);

  const mutation = useApiMutation({
    mutationFn: (values) => libraryService.submitPayment(values),
    invalidate: ['library', 'subscription', 'messages'],
    successMessage: (res) =>
      res?.message || 'Payment submitted for review. Please also send screenshot to WhatsApp 03158750992.',
    onSuccess: () => {
      onClose();
      onDone?.();
    },
  });

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <CreditCard className="h-5 w-5" />
          </div>
          <DialogTitle>Submit Payment Verification</DialogTitle>
          <DialogDescription>
            Enter your transaction details so administrators can verify your payment and activate your subscription.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Amount Paid (Rs.)" htmlFor="sp-amount" required error={errors.amount?.message}>
              <Input id="sp-amount" type="number" min={1} {...register('amount')} error={errors.amount} />
            </Field>

            <Field label="Payment Method Used" htmlFor="sp-method" required error={errors.method?.message}>
              <Controller
                control={control}
                name="method"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="sp-method"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field
              label="Transaction / Reference ID"
              htmlFor="sp-ref"
              required
              error={errors.reference?.message}
              hint="Found in your SadaPay, NayaPay or Easypaisa receipt"
              className="sm:col-span-2"
            >
              <Input
                id="sp-ref"
                placeholder="e.g. TRX982736412"
                {...register('reference')}
                error={errors.reference}
              />
            </Field>

            <Field label="Sender Account Name" htmlFor="sp-sender-name">
              <Input id="sp-sender-name" placeholder="Name on bank / wallet" {...register('senderName')} />
            </Field>

            <Field label="Sender Number / Account" htmlFor="sp-sender-account">
              <Input id="sp-sender-account" placeholder="e.g. 03xx xxxxxxx" {...register('senderAccount')} />
            </Field>
          </div>

          <Field label="Notes / Comments" htmlFor="sp-notes">
            <Textarea
              id="sp-notes"
              rows={2}
              placeholder="Any additional details about this payment"
              {...register('notes')}
            />
          </Field>

          {/* WhatsApp Verification Reminder Box */}
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3.5 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-300">
              <WhatsAppIcon className="h-4 w-4" />
              <span>WhatsApp Verification Required</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              After submitting, send your payment receipt/screenshot to WhatsApp{' '}
              <a
                href={OFFICIAL_BILLING_INFO.whatsappUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="font-mono font-bold text-foreground underline hover:text-emerald-600"
              >
                {OFFICIAL_BILLING_INFO.whatsappNumber}
              </a>{' '}
              for instant review.
            </p>
          </div>

          {mutation.isError && (
            <Alert tone="destructive">{mutation.error?.message || 'Could not submit payment details'}</Alert>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              <Send className="h-4 w-4" /> Submit for Verification
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
