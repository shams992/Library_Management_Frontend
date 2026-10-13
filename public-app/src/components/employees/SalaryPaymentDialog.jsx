import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Banknote, HandCoins } from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';
import { Field } from '../ui/label.jsx';
import { Switch } from '../ui/misc.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';
import { Alert } from '../ui/feedback.jsx';
import { employeeService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { formatMoney, periodToLabel } from '../../utils/format.js';
import { PAYMENT_METHODS } from '../../utils/constants.js';

const schema = z.object({
  amount: z.coerce.number().min(1, 'Enter the amount being paid').max(10000000),
  method: z.enum(['cash', 'bank_transfer', 'easypaisa', 'jazzcash', 'card', 'other']),
  reference: z.string().trim().max(120).optional(),
  note: z.string().trim().max(300).optional(),
  paidAt: z.string().optional(),
  createExpense: z.boolean().optional(),
});

/**
 * Pays one salary row in full or in part. Each instalment is stored on the row,
 * so a half-paid month stays visibly half-paid instead of looking settled.
 */
export const SalaryPaymentDialog = ({ salary, open, onOpenChange, onDone }) => {
  const currency = useCurrency();
  const payable = Number(salary?.netAmount ?? 0);
  const alreadyPaid = Number(salary?.paidAmount ?? 0);
  const balance = Math.max(0, payable - alreadyPaid);
  const [quick, setQuick] = useState('full');

  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { amount: balance, method: 'cash', reference: '', note: '', paidAt: new Date().toISOString().slice(0, 10), createExpense: true },
  });

  useEffect(() => {
    if (open && salary) {
      setQuick('full');
      reset({ amount: balance, method: 'cash', reference: '', note: '', paidAt: new Date().toISOString().slice(0, 10), createExpense: true });
    }
  }, [open, salary, balance, reset]);

  const mutation = useApiMutation({
    mutationFn: (values) => employeeService.paySalary(salary.id, values),
    invalidate: ['employees', 'expenses', 'finance', 'dashboard'],
    successMessage: 'Salary payment recorded',
    onSuccess: () => { onOpenChange(false); onDone?.(); },
  });

  if (!salary) return null;

  const half = Math.round(balance / 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HandCoins className="h-4 w-4 text-primary" /> Pay salary
          </DialogTitle>
          <DialogDescription>
            {salary.employeeName || salary.fullName || 'Employee'} · {periodToLabel(salary.periodKey)}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Net salary</span>
            <span className="font-medium">{formatMoney(payable, currency)}</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-muted-foreground">Already paid</span>
            <span className="font-medium">{formatMoney(alreadyPaid, currency)}</span>
          </div>
          {Number(salary.bonus) > 0 || Number(salary.deduction) > 0 ? (
            <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
              <span>Bonus / deduction</span>
              <span>+{formatMoney(salary.bonus || 0, currency)} / −{formatMoney(salary.deduction || 0, currency)}</span>
            </div>
          ) : null}
          <div className="mt-1.5 flex items-center justify-between border-t border-border pt-1.5">
            <span className="text-muted-foreground">Balance</span>
            <span className="font-semibold text-destructive">{formatMoney(balance, currency)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="xs" variant={quick === 'full' ? 'default' : 'outline'} onClick={() => { setQuick('full'); setValue('amount', balance); }}>
              Full {formatMoney(balance, currency)}
            </Button>
            <Button type="button" size="xs" variant={quick === 'half' ? 'default' : 'outline'} onClick={() => { setQuick('half'); setValue('amount', half); }}>
              Half {formatMoney(half, currency)}
            </Button>
            <Button type="button" size="xs" variant={quick === 'custom' ? 'default' : 'outline'} onClick={() => setQuick('custom')}>
              Custom amount
            </Button>
          </div>

          <Field label="Amount" htmlFor="sal-amount" required error={errors.amount?.message} hint={`Maximum ${formatMoney(balance, currency)} to settle this month.`}>
            <Input id="sal-amount" type="number" min={1} max={Math.max(balance, 1)} {...register('amount')} error={errors.amount} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Method" htmlFor="sal-method">
              <Controller
                control={control}
                name="method"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="sal-method"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Paid on" htmlFor="sal-date">
              <Input id="sal-date" type="date" {...register('paidAt')} />
            </Field>
          </div>

          <Field label="Reference / receipt no." htmlFor="sal-ref" error={errors.reference?.message}>
            <Input id="sal-ref" {...register('reference')} placeholder="Optional" />
          </Field>
          <Field label="Note" htmlFor="sal-note" error={errors.note?.message}>
            <Input id="sal-note" {...register('note')} placeholder="Optional" />
          </Field>

          <label className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-border bg-muted/30 p-3.5">
            <span>
              <span className="block text-sm font-medium">Post this to expenses</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Keeps your profit report accurate — recommended.
              </span>
            </span>
            <Controller
              control={control}
              name="createExpense"
              render={({ field }) => <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />}
            />
          </label>

          {mutation.isError ? <Alert tone="destructive">{mutation.error.message}</Alert> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" loading={mutation.isPending} disabled={balance <= 0}>
              <Banknote className="h-4 w-4" /> Record payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SalaryPaymentDialog;
