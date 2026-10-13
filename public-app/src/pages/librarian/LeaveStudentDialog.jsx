import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserMinus } from 'lucide-react';
import { Button } from '../../components/ui/button.jsx';
import { Input, Textarea } from '../../components/ui/input.jsx';
import { Field } from '../../components/ui/label.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog.jsx';
import { Alert } from '../../components/ui/feedback.jsx';

const schema = z.object({
  date: z.string().optional(),
  reason: z.string().trim().min(3, 'Please give a reason for leaving').max(300),
  refundAmount: z.coerce.number().min(0).max(1000000).optional(),
  refundNote: z.string().trim().max(300).optional(),
  notes: z.string().trim().max(1000).optional(),
});

/**
 * Student leaving flow: records the reason/refund, keeps the history and frees
 * the seat. Nothing is deleted — the student can be reactivated later.
 */
export const LeaveStudentDialog = ({ student, open, onOpenChange, onConfirm, loading }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { date: new Date().toISOString().slice(0, 10), reason: '', refundAmount: 0 },
  });

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-warning/14">
            <UserMinus className="h-5 w-5 text-warning" />
          </div>
          <DialogTitle>Mark {student.fullName} as left</DialogTitle>
          <DialogDescription>
            The student record and all fee history are kept. Seat {student.seatNumber || '—'} will be released and become
            available immediately.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((values) => { onConfirm(values); reset(); })}
          noValidate
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Leaving date" htmlFor="leave-date">
              <Input id="leave-date" type="date" {...register('date')} />
            </Field>
            <Field label="Security deposit refund" htmlFor="leave-refund">
              <Input id="leave-refund" type="number" min={0} {...register('refundAmount')} />
            </Field>
          </div>
          <Field label="Reason for leaving" htmlFor="leave-reason" required error={errors.reason?.message}>
            <Input id="leave-reason" {...register('reason')} error={errors.reason} placeholder="e.g. Relocated, completed exams, joined another library" />
          </Field>
          <Field label="Refund note" htmlFor="leave-refund-note" error={errors.refundNote?.message}>
            <Input id="leave-refund-note" {...register('refundNote')} placeholder="Optional" />
          </Field>
          <Field label="Internal notes" htmlFor="leave-notes" error={errors.notes?.message}>
            <Textarea id="leave-notes" rows={2} {...register('notes')} placeholder="Anything worth remembering about this exit" />
          </Field>

          <Alert tone="info" icon>
            Leaving records appear in the “Left” filter and in the student report, so your history stays complete.
          </Alert>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="destructive" loading={loading}>
              Confirm — mark as left
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
