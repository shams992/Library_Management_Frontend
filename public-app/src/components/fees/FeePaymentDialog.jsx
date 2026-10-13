import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Banknote, Info } from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';
import { Field } from '../ui/label.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';
import { Alert } from '../ui/feedback.jsx';
import { feeService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { PAYMENT_METHODS } from '../../utils/constants.js';
import { formatMoney, periodToLabel } from '../../utils/format.js';

const schema = z.object({
  amount: z.coerce.number().min(1, 'Enter the amount received').max(10000000),
  method: z.enum(['cash', 'bank_transfer', 'easypaisa', 'jazzcash', 'card', 'other']),
  reference: z.string().trim().max(120).optional(),
  note: z.string().trim().max(300).optional(),
  paidAt: z.string().optional(),
});

/**
 * Records a full or partial payment against one invoice.
 * Balances are computed from the invoice itself, so the dialog can never over-suggest.
 */
export const FeePaymentDialog = ({ fee, open, onOpenChange, onDone, onSuccess }) => {
  // `onSuccess` kept as an alias so both page-level and dialog-level callers work.
  const handleDone = onDone || onSuccess;
  const currency = useCurrency();
  const payable = fee ? Math.max(0, (fee.amount || 0) - (fee.discount || 0)) : 0;
  const balance = fee ? Math.max(0, payable - (fee.paidAmount || 0)) : 0;

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0, method: 'cash', reference: '', note: '', paidAt: new Date().toISOString().slice(0, 10) },
  });

  useEffect(() => {
    if (open && fee) {
      reset({
        amount: balance,
        method: 'cash',
        reference: '',
        note: '',
        paidAt: new Date().toISOString().slice(0, 10),
      });
    }
  }, [open, fee, balance, reset]);

  const mutation = useApiMutation({
    mutationFn: (values) => feeService.pay(fee.id, values),
    invalidate: ['fees', 'dashboard', 'students', 'finance', 'notifications'],
    successMessage: 'Payment recorded',
    onSuccess: () => { onOpenChange(false); handleDone?.(); },
  });

  if (!fee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            {fee.studentName} · {periodToLabel(fee.periodKey)}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Payable</span>
            <span className="font-medium">{formatMoney(payable, currency)}</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-muted-foreground">Already paid</span>
            <span className="font-medium">{formatMoney(fee.paidAmount || 0, currency)}</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between border-t border-border pt-1.5">
            <span className="text-muted-foreground">Balance</span>
            <span className="font-semibold text-destructive">{formatMoney(balance, currency)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate className="space-y-4">
          <Field label="Amount received" htmlFor="pay-amount" required error={errors.amount?.message} hint={balance ? `Max ${formatMoney(balance, currency)} to clear this invoice.` : 'This invoice is already fully paid.'}>
            <Input id="pay-amount" type="number" min={1} max={Math.max(balance, 1)} step="1" {...register('amount')} error={errors.amount} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Payment method" htmlFor="pay-method">
              <Controller
                control={control}
                name="method"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="pay-method"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Payment date" htmlFor="pay-date">
              <Input id="pay-date" type="date" {...register('paidAt')} />
            </Field>
          </div>

          <Field label="Reference / receipt no." htmlFor="pay-ref" error={errors.reference?.message}>
            <Input id="pay-ref" {...register('reference')} placeholder="Optional — e.g. Easypaisa TID" />
          </Field>
          <Field label="Note" htmlFor="pay-note" error={errors.note?.message}>
            <Input id="pay-note" {...register('note')} placeholder="Optional" />
          </Field>

          <Alert tone="info" icon>
            Partial payments are supported — the invoice stays open until the balance reaches zero, and every instalment is kept.
          </Alert>

          {mutation.isError ? <Alert tone="destructive">{mutation.error.message}</Alert> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" loading={mutation.isPending}>
              <Banknote className="h-4 w-4" /> Record payment
            </Button>
          </DialogFooter>
        </form>
        <p className="sr-only inline-flex items-center gap-1.5"><Info className="h-3.5 w-3.5" /> Payment recorded by the library</p>
      </DialogContent>
    </Dialog>
  );
};

export default FeePaymentDialog;
