import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { Input, Textarea } from '../ui/input.jsx';
import { Field } from '../ui/label.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog.jsx';
import { Alert } from '../ui/feedback.jsx';
import { feeService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { formatMoney, periodToLabel } from '../../utils/format.js';

const schema = z.object({
  amount: z.coerce.number().min(0, 'Amount cannot be negative').max(1000000),
  discount: z.coerce.number().min(0, 'Discount cannot be negative').max(1000000),
  dueDate: z.string().optional(),
  notes: z.string().trim().max(300).optional(),
});

/**
 * Adjust an invoice: change the payable amount, add a discount (sibling discount,
 * scholarship, waiver…) or move the due date. Payments already recorded are kept.
 */
export const FeeAdjustDialog = ({ fee, open, onOpenChange, onDone }) => {
  const currency = useCurrency();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0, discount: 0, dueDate: '', notes: '' },
  });

  useEffect(() => {
    if (open && fee) {
      reset({
        amount: fee.amount ?? 0,
        discount: fee.discount ?? 0,
        dueDate: fee.dueDate ? String(fee.dueDate).slice(0, 10) : '',
        notes: fee.notes || '',
      });
    }
  }, [open, fee, reset]);

  const mutation = useApiMutation({
    mutationFn: (values) => feeService.update(fee.id, values),
    invalidate: ['fees', 'dashboard', 'finance', 'students'],
    successMessage: 'Invoice updated',
    onSuccess: () => { onOpenChange(false); onDone?.(); },
  });

  if (!fee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust invoice</DialogTitle>
          <DialogDescription>
            {fee.studentName} · {periodToLabel(fee.periodKey)}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Currently payable</span>
            <span className="font-medium">{formatMoney(fee.amount - (fee.discount || 0), currency)}</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-muted-foreground">Already paid</span>
            <span className="font-medium">{formatMoney(fee.paidAmount, currency)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Invoice amount" htmlFor="adj-amount" error={errors.amount?.message}>
              <Input id="adj-amount" type="number" min={0} {...register('amount')} error={errors.amount} />
            </Field>
            <Field label="Discount / waiver" htmlFor="adj-discount" error={errors.discount?.message}>
              <Input id="adj-discount" type="number" min={0} {...register('discount')} error={errors.discount} />
            </Field>
          </div>
          <Field label="Due date" htmlFor="adj-due">
            <Input id="adj-due" type="date" {...register('dueDate')} />
          </Field>
          <Field label="Reason / note" htmlFor="adj-notes" error={errors.notes?.message}>
            <Textarea id="adj-notes" rows={2} {...register('notes')} placeholder="e.g. Sibling discount, medical leave waiver" />
          </Field>

          <Alert tone="info" icon>
            Recorded payments stay untouched. If the new payable amount is lower than what was already paid, the invoice simply
            shows as fully paid.
          </Alert>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" loading={mutation.isPending}>
              <SlidersHorizontal className="h-4 w-4" /> Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
