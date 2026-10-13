import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Armchair, LogOut, Search, UserPlus, UserRound } from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';
import { Field } from '../ui/label.jsx';
import { Badge } from '../ui/badge.jsx';
import { StatusBadge } from '../ui/status-badge.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';
import { Alert, Spinner } from '../ui/feedback.jsx';
import { Avatar, AvatarFallback, Separator } from '../ui/misc.jsx';
import { ConfirmDialog } from '../ui/confirm-dialog.jsx';
import { seatService, studentService } from '../../services/index.js';
import { useApiMutation } from '../../hooks/useApiMutation.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { formatMoney, initials } from '../../utils/format.js';
import { SEAT_STATUS_META } from '../../utils/constants.js';

/**
 * One dialog for everything that can happen to a seat: assign a student who has
 * no seat yet, swap in a different student, or release the seat back to the pool.
 */
export const SeatAssignDialog = ({ seat, open, onOpenChange, onDone }) => {
  const currency = useCurrency();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [studentId, setStudentId] = useState('');
  const [status, setStatus] = useState('available');
  const [confirmRelease, setConfirmRelease] = useState(false);

  const occupantId = seat?.student?.id || null;

  useEffect(() => {
    if (!open) return;
    setSearch('');
    setStudentId('');
    setStatus(seat?.status === 'occupied' ? 'available' : seat?.status || 'available');
  }, [open, seat]);

  // Only students without a seat can be placed here — no double-booking.
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['students', 'unseated', debouncedSearch],
    queryFn: () => studentService.list({ unseated: true, search: debouncedSearch || undefined, limit: 100 }),
    enabled: open && !occupantId,
    staleTime: 30_000,
  });

  const candidates = useMemo(
    () => (data?.data || []).filter((student) => String(student.id) !== String(occupantId)),
    [data, occupantId]
  );

  const selected = candidates.find((student) => String(student.id) === String(studentId));

  const close = () => { onOpenChange(false); onDone?.(); };

  const assignMutation = useApiMutation({
    mutationFn: () => seatService.update(seat.id, { studentId }),
    invalidate: ['seats', 'students', 'fees', 'dashboard'],
    successMessage: `Seat ${seat?.number} assigned`,
    onSuccess: close,
  });

  const statusMutation = useApiMutation({
    mutationFn: () => seatService.update(seat.id, { status, studentId: null }),
    invalidate: ['seats'],
    successMessage: 'Seat updated',
    onSuccess: close,
  });

  const releaseMutation = useApiMutation({
    mutationFn: () => seatService.update(seat.id, { studentId: null }),
    invalidate: ['seats', 'students', 'dashboard'],
    successMessage: `Seat ${seat?.number} is free again`,
    onSuccess: () => { setConfirmRelease(false); close(); },
  });

  if (!seat) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : onOpenChange(false))}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Armchair className="h-4 w-4 text-primary" /> Seat {seat.number}
            </DialogTitle>
            <DialogDescription>
              {seat.zone || 'Main Hall'}
              {seat.floor ? ` · Floor ${seat.floor}` : ''}
              {seat.monthlyFeeOverride ? ` · ${formatMoney(seat.monthlyFeeOverride, currency)} per month (seat rate)` : ''}
            </DialogDescription>
          </DialogHeader>

          {occupantId ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-4">
                <Avatar className="h-11 w-11">
                  <AvatarFallback>{initials(seat.student?.name || 'Student')}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{seat.student?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {seat.student?.code || 'Student'}
                    {seat.student?.phone ? ` · ${seat.student.phone}` : ''}
                  </p>
                </div>
                <StatusBadge kind="seat" status="occupied" />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to={`/librarian/students/${occupantId}`}>
                    <UserRound className="h-3.5 w-3.5" /> Open student profile
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => setConfirmRelease(true)} loading={releaseMutation.isPending}>
                  <LogOut className="h-3.5 w-3.5" /> Release seat
                </Button>
              </div>

              <Alert tone="info" icon>
                Releasing the seat keeps the student on your register — it only frees the seat for someone else.
              </Alert>
            </div>
          ) : (
            <div className="space-y-4">
              <Field label="Find a student without a seat" htmlFor="seat-student-search" hint="Search by name, ID or phone.">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="seat-student-search"
                    className="pl-9"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Start typing a name…"
                  />
                </div>
              </Field>

              {isLoading ? (
                <div className="flex items-center gap-2 rounded-xl border border-border p-4 text-sm text-muted-foreground">
                  <Spinner className="h-4 w-4" /> Loading students without a seat…
                </div>
              ) : isError ? (
                <Alert tone="destructive">{error?.message || 'Could not load students.'}</Alert>
              ) : candidates.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                  {debouncedSearch
                    ? 'No unseated student matches that search.'
                    : 'Every active student already has a seat. Add a new student first and they will appear here.'}
                </div>
              ) : (
                <Field label="Student" htmlFor="seat-student">
                  <Select value={studentId} onValueChange={setStudentId}>
                    <SelectTrigger id="seat-student">
                      <SelectValue placeholder={`${candidates.length} student(s) without a seat`} />
                    </SelectTrigger>
                    <SelectContent>
                      {candidates.map((student) => (
                        <SelectItem key={student.id} value={String(student.id)}>
                          {student.fullName} · {student.studentCode || 'no ID'}
                          {student.monthlyFee ? ` · Rs. ${Number(student.monthlyFee).toLocaleString()}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}

              {selected ? (
                <div className="rounded-xl border border-border bg-muted/40 p-3.5 text-sm">
                  <p className="font-medium">{selected.fullName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {selected.studentCode || 'No student ID'} · {selected.phone || 'No phone'}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge tone="muted">{formatMoney(selected.monthlyFee || 0, currency)} / month</Badge>
                    <StatusBadge status={selected.status} kind="student" />
                  </div>
                </div>
              ) : null}

              <Separator />

              <Field label="Or set this seat's status" htmlFor="seat-status" hint="Use this for seats kept back for reservations or repairs.">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="seat-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['available', 'reserved', 'maintenance'].map((value) => (
                      <SelectItem key={value} value={value}>{SEAT_STATUS_META[value]?.label || value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {statusMutation.isError ? <Alert tone="destructive">{statusMutation.error.message}</Alert> : null}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            {!occupantId ? (
              studentId ? (
                <Button onClick={() => assignMutation.mutate()} loading={assignMutation.isPending}>
                  <UserPlus className="h-4 w-4" /> Assign seat
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => statusMutation.mutate()}
                  loading={statusMutation.isPending}
                >
                  Save seat status
                </Button>
              )
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmRelease}
        onOpenChange={setConfirmRelease}
        title={`Release seat ${seat.number}?`}
        description={`${seat.student?.name || 'The student'} will keep their registration and fee history, but the seat becomes available for someone else.`}
        confirmLabel="Release seat"
        loading={releaseMutation.isPending}
        onConfirm={() => releaseMutation.mutate()}
      />
    </>
  );
};

export default SeatAssignDialog;
