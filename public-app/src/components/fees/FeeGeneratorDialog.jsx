import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarPlus } from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';
import { Field } from '../ui/label.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';
import { Alert } from '../ui/feedback.jsx';
import { feeService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { currentPeriod, formatMoney, periodOptions } from '../../utils/format.js';

const schema = z.object({
  period: z.string().min(7, 'Choose a billing month'),
  dueDay: z.coerce.number().int().min(1).max(28),
  onlyActive: z.boolean().optional(),
  notifyStudents: z.boolean().optional(),
  studentIds: z.array(z.string()).optional(),
});

/**
 * Generates monthly invoices for every active student with a monthly fee.
 * Re-running for the same period is safe: existing invoices are skipped.
 */
export const FeeGeneratorDialog = ({ open, onOpenChange, period, onDone }) => {
  const currency = useCurrency();
  const periods = periodOptions(12);

  const { register, handleSubmit, control, reset, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { period: period || currentPeriod(), dueDay: 10, onlyActive: true, notifyStudents: true },
  });

  useEffect(() => {
    if (open) reset({ period: period || currentPeriod(), dueDay: 10, onlyActive: true, notifyStudents: true });
  }, [open, period, reset]);

  const mutation = useApiMutation({
    mutationFn: (values) => feeService.generate(values),
    invalidate: ['fees', 'dashboard', 'finance', 'library', 'notifications'],
    successMessage: (response) => response?.message || 'Invoices generated',
    onSuccess: (response) => {
      // Surface exactly what the API did — created / skipped counts.
      const created = response?.data?.created;
      if (created !== undefined) {
        // eslint-disable-next-line no-console
        console.info('Invoice generation:', response.data);
      }
      onOpenChange(false);
      onDone?.();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Generate monthly invoices</DialogTitle>
          <DialogDescription>
            Creates one invoice per active student using their own monthly fee. Students who already have an invoice for the
            chosen month are skipped — nothing is ever double-billed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Billing month" htmlFor="gen-period" required>
              <Controller
                control={control}
                name="period"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="gen-period"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {periods.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Payment due day" htmlFor="gen-due" hint="Day of the month the fee is due.">
              <Input id="gen-due" type="number" min={1} max={28} {...register('dueDay')} />
            </Field>
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4">
            <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary" {...register('notifyStudents')} />
            <span className="text-sm text-muted-foreground">
              <strong className="text-foreground">Notify students with a portal account</strong> — they see the new invoice in
              their dashboard and receive an in-app notification.
            </span>
          </label>

          <Alert tone="info" icon>
            Example: a student paying {formatMoney(3000, currency)} gets a {formatMoney(3000, currency)} invoice for the month. Add
            discounts or extra charges afterwards with “Adjust”.
          </Alert>

          {mutation.isError ? <Alert tone="destructive">{mutation.error.message}</Alert> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" loading={mutation.isPending}>
              <CalendarPlus className="h-4 w-4" /> Generate invoices
            </Button>
          </DialogFooter>
        </form>
        <p className="sr-only" aria-live="polite">{watch('period')}</p>
      </DialogContent>
    </Dialog>
  );
};
