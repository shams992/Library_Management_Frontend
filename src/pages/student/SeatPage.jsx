import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  Armchair,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  LayoutGrid,
  MapPin,
  Phone,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Users,
  VolumeX,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Separator } from '../../components/ui/misc.jsx';
import { Alert, LoadingBlock } from '../../components/ui/feedback.jsx';
import { SeatMap } from '../../components/seats/SeatMap.jsx';
import { portalService } from '../../services/index.js';
import { useCurrency } from '../../hooks/useSettings.js';
import { formatMoney } from '../../utils/format.js';

/** "My Seat": Student dashboard view for assigned seat details, layout, and library guidelines. */
export default function StudentSeatPage() {
  const currency = useCurrency();

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['portal', 'student', 'seat'],
    queryFn: () => portalService.studentSeat(),
  });

  const seat = data?.data?.seat;
  const seats = data?.data?.seats || [];
  const summary = data?.data?.summary;
  const library = data?.data?.library;
  const student = data?.data?.student;

  if (isLoading) {
    return <LoadingBlock label="Loading your seat information…" className="min-h-[40vh]" />;
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Seat" description="Your reserved study desk in the library." />
        <Card className="border-destructive/30">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertCircle className="h-7 w-7" />
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="text-lg font-semibold text-foreground">Could not load seat details</h3>
              <p className="text-sm text-muted-foreground">
                {error?.message || 'We were unable to load your seat assignment. Please check your connection and try again.'}
              </p>
            </div>
            <Button onClick={() => refetch()} loading={isFetching} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const shiftLabel = student?.shift ? student.shift.replace('_', ' ') : 'Full Day';
  const feeAmount = seat?.monthlyFeeOverride ?? summary?.monthlyFee ?? student?.monthlyFee ?? 0;

  return (
    <div className="space-y-6">
      {/* A. Page Header */}
      <PageHeader
        title="My Seat"
        description={
          library
            ? `${library.name} · ${library.openingTime || '08:00'} – ${library.closingTime || '22:00'} · ${shiftLabel} Shift`
            : 'Your reserved study seat and desk allocation'
        }
      />

      {/* When student does NOT have a seat assigned */}
      {!seat ? (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-warning/15 text-warning">
              <Armchair className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">No seat assigned yet</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your admission is active, but a dedicated seat has not been assigned to your profile yet.
                Please visit the front desk or contact your librarian to allocate a seat based on your shift and preference.
              </p>
              {library?.phone && (
                <p className="pt-2 text-xs text-muted-foreground">
                  Library helpline: <a href={`tel:${library.phone}`} className="font-semibold text-foreground underline">{library.phone}</a>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* B. Assigned Seat Highlight Card (Primary Visual Focus) */}
          <Card className="overflow-hidden border-border bg-gradient-to-br from-card via-card to-primary/5 shadow-xs">
            <CardContent className="p-6 sm:p-7">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start sm:items-center gap-5">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-warning/15 text-warning border border-warning/30 shadow-inner">
                    <Armchair className="h-10 w-10" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Assigned Study Desk
                      </span>
                      <Badge tone={seat.status === 'occupied' ? 'warning' : 'success'} className="capitalize text-xs font-semibold">
                        {seat.status === 'occupied' ? 'Assigned to You' : seat.status}
                      </Badge>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
                        {seat.number}
                      </h2>
                      <span className="text-sm font-medium text-muted-foreground">
                        {library?.name}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <Badge tone="info" className="font-medium">
                        {seat.zone || 'Main Study Hall'}
                      </Badge>
                      <Badge tone="muted" className="font-medium">
                        {seat.floor ? `Floor ${seat.floor}` : 'Ground Floor'}
                      </Badge>
                      <Badge tone="primary" className="capitalize font-medium">
                        {shiftLabel} Shift
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-4 md:pt-0 gap-1 border-border/80">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Seat Monthly Fee
                  </span>
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {formatMoney(feeAmount, currency)}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {seat.monthlyFeeOverride ? 'Fixed desk rate' : 'Standard member fee'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* C. Seat Information Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="space-y-2 p-5 pt-5">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-semibold uppercase tracking-wider">Location &amp; Area</span>
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <p className="text-lg font-semibold text-foreground">{seat.zone || 'Main Hall'}</p>
                <p className="text-xs text-muted-foreground">
                  {seat.floor ? `Level ${seat.floor}` : 'Ground floor'} · Quiet study area
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-2 p-5 pt-5">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-semibold uppercase tracking-wider">Shift Schedule</span>
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <p className="text-lg font-semibold capitalize text-foreground">{shiftLabel}</p>
                <p className="text-xs text-muted-foreground">
                  {library ? `Open ${library.openingTime || '08:00'} – ${library.closingTime || '22:00'}` : 'Library working hours'}
                </p>
              </CardContent>
            </Card>

            <Card className="sm:col-span-2 lg:col-span-1">
              <CardContent className="space-y-2 p-5 pt-5">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-semibold uppercase tracking-wider">Seat Notes</span>
                  <Info className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground line-clamp-2">
                  {seat.notes || 'Dedicated single study desk with charging power access.'}
                </p>
                <p className="text-xs text-muted-foreground">Reserved exclusively for your shift.</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Main Grid: D. Library Layout (Left) + E. Rules & F. Details (Right) */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] items-start">
        {/* D. Library Layout Section */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-primary" /> Library Layout
            </CardTitle>
            <CardDescription>
              {seat ? `Your assigned seat (#${seat.number}) is highlighted on the floor map` : 'Overview of the library floor arrangement'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {seats.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-border bg-muted/20">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
                  <Armchair className="h-7 w-7" />
                </div>
                <h4 className="text-base font-semibold text-foreground">Interactive map not published</h4>
                <p className="mt-1.5 max-w-sm text-sm text-muted-foreground leading-relaxed">
                  Your library numbers seats directly on desks rather than using a 2D floor grid.
                  {seat?.number ? ` Your seat number #${seat.number} is fully active.` : ''}
                </p>
                {seat?.number && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-card border border-border px-3 py-1.5 text-xs font-semibold text-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Desk #{seat.number} confirmed
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <SeatMap seats={seats} summary={summary} currency={currency} selectedId={seat?.id} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: E. Seat Rules + F. Library Details */}
        <div className="space-y-6">
          {/* E. Seat Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldAlert className="h-4 w-4 text-primary" /> Study Rules &amp; Guidelines
              </CardTitle>
              <CardDescription>Policies designed to maintain a quiet, productive space</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 text-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground text-xs">Stay on your assigned desk</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Sit only on your allocated seat. Swapping without librarian approval disturbs attendance records.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground text-xs">Adhere to your shift timing</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Arrive and vacate within your designated shift hours. Seats may be shared by students in other shifts.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <VolumeX className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground text-xs">Keep phones silent</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Maintain absolute silence in study halls. Phone calls and discussions must be taken outside.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground text-xs">Desk tidiness &amp; safety</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Keep your desk clean and avoid leaving personal valuables unattended.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* F. Library Details */}
          {library && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="h-4 w-4 text-primary" /> Library Information
                </CardTitle>
                <CardDescription>Contact details for help and inquiries</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <span className="text-xs text-muted-foreground">Library Name</span>
                  <span className="font-semibold text-foreground">{library.name}</span>
                </div>
                {library.phone && (
                  <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <span className="text-xs text-muted-foreground">Helpline</span>
                    <a href={`tel:${library.phone}`} className="font-mono text-xs font-semibold text-primary hover:underline">
                      {library.phone}
                    </a>
                  </div>
                )}
                {library.address && (
                  <div className="flex items-start justify-between pb-2 border-b border-border/60 gap-3">
                    <span className="text-xs text-muted-foreground shrink-0">Address</span>
                    <span className="text-right text-xs font-medium text-foreground">
                      {library.address}{library.city ? `, ${library.city}` : ''}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Operating Hours</span>
                  <span className="font-medium text-xs text-foreground">
                    {library.openingTime || '08:00'} – {library.closingTime || '22:00'}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
