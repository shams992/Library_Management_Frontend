import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button.jsx';
import { Input, Textarea } from '../ui/input.jsx';
import { Field } from '../ui/label.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';
import { Alert } from '../ui/feedback.jsx';
import { expenseService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../utils/constants.js';

const schema = z.object({
  title: z.string().trim().max(160).optional(),
  amount: z.coerce.number().min(1, 'Enter the amount paid').max(10000000),
  category: z.enum(['rent', 'electricity', 'internet', 'maintenance', 'furniture', 'books', 'cleaning', 'equipment', 'marketing', 'taxes', 'other']),
  date: z.string().optional(),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'easypaisa', 'jazzcash', 'card', 'other']),
  vendor: z.string().trim().max(160).optional(),
  description: z.string().trim().max(800).optional(),
});

const EMPTY = {
  title: '', amount: 0, category: 'rent', date: new Date().toISOString().slice(0, 10),
  paymentMethod: 'cash', vendor: '', description: '',
};

/**
 * Records a library expense. When a title is left blank the API uses the category
 * name, so nothing shows up as an empty row in the ledger.
 */
export const ExpenseFormDialog = ({ open, onOpenChange, expense = null, onDone }) => {
  const isEdit = Boolean(expense);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      expense
        ? {
            ...EMPTY,
            ...expense,
            date: expense.date ? String(expense.date).slice(0, 10) : EMPTY.date,
            paymentMethod: expense.paymentMethod || 'cash',
            description: expense.description || expense.note || '',
          }
        : EMPTY
    );
  }, [open, expense, reset]);

  const mutation = useApiMutation({
    mutationFn: (values) => (isEdit ? expenseService.update(expense.id, values) : expenseService.create(values)),
    invalidate: ['expenses', 'finance', 'dashboard'],
    successMessage: isEdit ? 'Expense updated' : 'Expense recorded',
    onSuccess: () => { onOpenChange(false); onDone?.(); },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit expense' : 'Add an expense'}</DialogTitle>
          <DialogDescription>
            Rent, bills, repairs, supplies — recording these keeps your monthly profit honest. Salary payments post here automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="What was it for?" htmlFor="exp-title" error={errors.title?.message} className="sm:col-span-2" hint="Optional — a clear title makes the ledger easier to read later.">
              <Input id="exp-title" {...register('title')} error={errors.title} placeholder="e.g. August electricity bill" />
            </Field>
            <Field label="Amount" htmlFor="exp-amount" required error={errors.amount?.message}>
              <Input id="exp-amount" type="number" min={1} {...register('amount')} error={errors.amount} />
            </Field>
            <Field label="Category" htmlFor="exp-category" required>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="exp-category"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Date" htmlFor="exp-date">
              <Input id="exp-date" type="date" {...register('date')} />
            </Field>
            <Field label="Paid via" htmlFor="exp-method">
              <Controller
                control={control}
                name="paymentMethod"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="exp-method"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Vendor / payee" htmlFor="exp-vendor" error={errors.vendor?.message} className="sm:col-span-2">
              <Input id="exp-vendor" {...register('vendor')} placeholder="e.g. K-Electric, landlord, book supplier" />
            </Field>
            <Field label="Notes" htmlFor="exp-desc" className="sm:col-span-2" error={errors.description?.message}>
              <Textarea id="exp-desc" rows={2} {...register('description')} placeholder="Anything worth remembering about this cost" />
            </Field>
          </div>

          {mutation.isError ? <Alert tone="destructive">{mutation.error.message}</Alert> : null}

          {isEdit && expense?.id ? (
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-3.5 text-sm">
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Upload className="h-4 w-4" /> Attach a receipt (photo or PDF)
              </span>
              <span className="text-xs text-muted-foreground">Optional</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="sr-only"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  try {
                    await expenseService.uploadReceipt(expense.id, file);
                    toast.success('Receipt attached');
                    onDone?.();
                  } catch (error) {
                    toast.error(error.message || 'Could not upload the receipt');
                  }
                }}
              />
            </label>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" loading={mutation.isPending}>
              <Plus className="h-4 w-4" /> {isEdit ? 'Save changes' : 'Record expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseFormDialog;
