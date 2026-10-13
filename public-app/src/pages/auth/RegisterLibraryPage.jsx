import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Clock3,
  Eye,
  EyeOff,
  HelpCircle,
  Info,
  LayoutGrid,
  Lock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Receipt,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  UserRound,
  Users,
  WalletCards,
} from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from '../../components/common/Logo.jsx';
import { ThemeToggle } from '../../components/common/ThemeToggle.jsx';
import { WhatsAppIcon } from '../../components/common/WhatsAppIcon.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input, Textarea } from '../../components/ui/input.jsx';
import { Field } from '../../components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { Alert } from '../../components/ui/feedback.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { authService } from '../../services/index.js';
import { useSettings } from '../../hooks/useSettings.js';
import { LIBRARY_TYPES } from '../../utils/constants.js';
import { formatMoney } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';

const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

const schema = z
  .object({
    library: z.object({
      name: z.string().trim().min(3, 'Library name must be at least 3 characters').max(160, 'Library name is too long'),
      address: z.string().trim().min(5, 'Street address is required (at least 5 characters)').max(300),
      city: z.string().trim().min(2, 'City is required').max(80),
      province: z.string().trim().max(80).optional(),
      phone: z.string().trim().min(7, 'Enter a valid contact number').max(20),
      email: z.string().trim().email('Enter a valid library email address'),
      libraryType: z.enum(['reading_room', 'lending', 'hybrid', 'study_center']),
      seatCapacity: z.coerce
        .number({ invalid_type_error: 'Enter a valid number' })
        .int('Seat count must be an integer')
        .min(1, 'Number of seats must be at least 1')
        .max(5000, 'Maximum 5000 seats allowed'),
      openingTime: z.string().trim().min(4, 'Opening time is required').max(10).default('08:00'),
      closingTime: z.string().trim().min(4, 'Closing time is required').max(10).default('22:00'),
      description: z.string().trim().max(1200).optional(),
    }),
    librarian: z.object({
      name: z.string().trim().min(3, 'Your full name is required').max(120),
      phone: z.string().trim().min(7, 'Enter a valid phone number').max(20),
      email: z.string().trim().email('Enter a valid login email address'),
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[a-zA-Z]/, 'Password must include at least one letter')
        .regex(/\d/, 'Password must include at least one number'),
      confirmPassword: z.string().min(1, 'Please confirm your password'),
    }),
    termsAccepted: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the Terms & Conditions and Privacy Policy' }),
    }),
  })
  .refine((data) => data.librarian.password === data.librarian.confirmPassword, {
    path: ['librarian', 'confirmPassword'],
    message: 'Passwords do not match',
  });

const STEPS = [
  { id: 'library', number: 1, label: 'Library details', shortDesc: 'Name, address & capacity', icon: Building2 },
  { id: 'librarian', number: 2, label: 'Your account', shortDesc: 'Librarian credentials', icon: UserRound },
  { id: 'review', number: 3, label: 'Review & submit', shortDesc: 'Confirm & apply', icon: ShieldCheck },
];

export default function RegisterLibraryPage() {
  const { subscription, registration, brand } = useSettings();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [summary, setSummary] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      library: {
        name: '',
        address: '',
        city: '',
        province: '',
        phone: '',
        email: '',
        libraryType: 'reading_room',
        seatCapacity: 40,
        openingTime: '08:00',
        closingTime: '22:00',
        description: '',
      },
      librarian: {
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
      },
      termsAccepted: false,
    },
  });

  const mutation = useMutation({
    mutationFn: (values) => {
      // Clean up values for backend (strip confirmPassword from payload)
      const payload = {
        library: {
          ...values.library,
          province: values.library.province || '',
          description: values.library.description || '',
        },
        librarian: {
          name: values.librarian.name,
          phone: values.librarian.phone,
          email: values.librarian.email,
          password: values.librarian.password,
        },
        termsAccepted: values.termsAccepted,
      };
      return authService.registerLibrary(payload);
    },
    onSuccess: (response) => {
      setSummary(response.data);
      toast.success('Registration submitted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Could not submit your registration');
    },
  });

  const validateAndProceed = async (targetStep) => {
    let fieldsToValidate = [];
    if (step === 0) {
      fieldsToValidate = ['library'];
    } else if (step === 1) {
      fieldsToValidate = ['librarian'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(targetStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = async (targetIndex) => {
    // Users can freely navigate to already completed earlier steps
    if (targetIndex < step) {
      setStep(targetIndex);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // For moving forward, validate current step first
    if (targetIndex === step + 1) {
      await validateAndProceed(targetIndex);
    }
  };

  const currentValues = getValues();
  const seatCapacity = watch('library.seatCapacity');
  const selectedType = watch('library.libraryType');

  // Confirmation screen after submission (Section 3)
  if (mutation.isSuccess && summary) {
    const isPending = summary.library?.status === 'pending' || summary.requiresApproval !== false;
    return (
      <div className="min-h-screen bg-muted/20 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between border-b border-border/80 pb-4">
            <Logo brandName={brand.name} />
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back to homepage
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-10">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/12 text-success shadow-inner">
                <CheckCircle2 className="h-9 w-9 text-success" />
              </div>

              <span className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-success">
                <BadgeCheck className="h-3.5 w-3.5" /> Application submitted successfully
              </span>

              <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Your registration is under review
              </h1>

              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                Thank you for registering <strong className="text-foreground">{summary.library?.name}</strong>.
                Our administration team will verify your details. Once approved, your{' '}
                <strong className="text-foreground">{subscription.trialMonths}-month free trial</strong> will begin.
              </p>
            </div>

            {/* Application status & details card */}
            <div className="mt-8 rounded-xl border border-border/80 bg-muted/30 p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Library</p>
                  <p className="text-sm font-semibold text-foreground truncate">{summary.library?.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Application Status</p>
                  <div>
                    <Badge tone={isPending ? 'warning' : 'success'}>
                      {isPending ? 'Pending admin approval' : 'Active & Approved'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Estimated Review Time</p>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Clock3 className="h-4 w-4 text-primary" />
                    Within 24 hours
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Free Trial Period</p>
                  <p className="text-sm font-semibold text-foreground">
                    {subscription.trialMonths} Month{subscription.trialMonths === 1 ? '' : 's'} (Starts on approval)
                  </p>
                </div>
              </div>
            </div>

            {/* What happens next steps */}
            <div className="mt-8 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">What happens next</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                    1
                  </div>
                  <p className="text-sm font-semibold text-foreground">Admin Verification</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Our team verifies library address and contact details to ensure platform trust and safety.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent-foreground font-bold text-xs">
                    2
                  </div>
                  <p className="text-sm font-semibold text-foreground">Trial Activation</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Once approved, your account unlocks immediately with your full {subscription.trialMonths}-month free trial period.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/15 text-success font-bold text-xs">
                    3
                  </div>
                  <p className="text-sm font-semibold text-foreground">Instant Setup</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Sign in with your email and password, customize your seat layout, and start onboarding students.
                  </p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 border-t border-border/80 pt-6">
              <Button size="lg" onClick={() => navigate('/login', { replace: true })} className="min-w-[180px]">
                Go to librarian sign-in <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/')}>
                Back to homepage
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 text-foreground">
      {/* Top clean navigation bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo brandName={brand.name} />

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              <ArrowLeft className="h-4 w-4" /> Back to website
            </Link>

            <span className="hidden h-4 w-px bg-border sm:inline-block" aria-hidden="true" />

            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-muted-foreground md:inline">Already registered?</span>
              <Button asChild variant="outline" size="sm">
                <Link to="/login">Sign in</Link>
              </Button>
            </div>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container: Clean 2-column layout on desktop, stacked on mobile */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12 items-start">
          {/* ========================================================
              LEFT COLUMN: Benefits, headline, trust, what happens next
             ======================================================== */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                First {subscription.trialMonths} {subscription.trialMonths === 1 ? 'month' : 'months'} free · No card required
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl leading-tight">
                Register your library on {brand.name}
              </h1>

              <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                Join modern private libraries and reading rooms. Transition from handwritten paper registers to an
                automated, all-in-one management platform.
              </p>
            </div>

            {/* 4 Benefits with Lucide icons */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Platform Benefits</h2>

              <ul className="space-y-3.5">
                {[
                  {
                    icon: ShieldCheck,
                    title: 'Multi-tenant isolation',
                    desc: "Your records, financials and student profiles are strictly segregated. Other libraries can never access your data.",
                    tone: 'text-primary bg-primary/10',
                  },
                  {
                    icon: LayoutGrid,
                    title: 'Intelligent seat management',
                    desc: 'Visual seat map with zones and occupancy status prevents double-booking and tracks real-time usage.',
                    tone: 'text-success bg-success/10',
                  },
                  {
                    icon: Receipt,
                    title: 'Automated fee tracking',
                    desc: 'Monthly fee invoices, part-payment tracking, overdue flags and WhatsApp/SMS reminder triggers.',
                    tone: 'text-info bg-info/10',
                  },
                  {
                    icon: TrendingUp,
                    title: 'Automatic profit calculations',
                    desc: 'Net Profit = Total Income - Total Expenses. Operating costs and staff payroll automatically combined.',
                    tone: 'text-accent-foreground bg-accent/15',
                  },
                ].map(({ icon: Icon, title, desc, tone }) => (
                  <li key={title} className="flex items-start gap-3">
                    <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', tone)}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{title}</p>
                      <p className="text-xs leading-relaxed text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* "What happens next" card - properly styled and non-overflowing */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">What happens next</h2>
                <span className="text-[0.7rem] text-primary font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Quick Review
                </span>
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[0.7rem] font-bold text-primary-foreground">
                    1
                  </span>
                  <div className="text-xs leading-relaxed">
                    <strong className="text-foreground">Submit details:</strong> Takes 3 minutes. No payment details required.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[0.7rem] font-bold text-muted-foreground">
                    2
                  </span>
                  <div className="text-xs leading-relaxed">
                    <strong className="text-foreground">Admin verification:</strong> Our team reviews applications within 24 hours to prevent spam and protect library privacy.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[0.7rem] font-bold text-muted-foreground">
                    3
                  </span>
                  <div className="text-xs leading-relaxed">
                    <strong className="text-foreground">2-month trial begins:</strong> After approval, your full dashboard unlocks with zero upfront charges.
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-3 mt-3 text-xs text-muted-foreground">
                Pricing after trial:{' '}
                <strong className="text-foreground">{formatMoney(subscription.priceMonthly, subscription)} / month</strong>.
                Cancel anytime — your data is never deleted.
              </div>
            </div>

            {/* Need Help / Contact Card */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Need help registering?</h2>
                <span className="text-[0.7rem] text-success font-medium">Official Support</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Have questions about branches, custom setup, or data migration? Talk to our team:
              </p>
              <div className="space-y-2 pt-1 text-xs">
                <a
                  href="https://wa.me/923158750992"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-foreground hover:border-emerald-500/60 hover:bg-emerald-500/10 transition-colors font-medium group"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <WhatsAppIcon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-emerald-800 dark:text-emerald-300">WhatsApp</p>
                    <p className="font-mono text-xs text-muted-foreground group-hover:text-foreground">03158750992</p>
                  </div>
                </a>
                <a
                  href="mailto:team@balochdev.com"
                  className="flex items-center gap-2.5 rounded-xl border border-primary/25 bg-primary/5 p-3 text-foreground hover:border-primary/50 hover:bg-primary/10 transition-colors font-medium group"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-primary shrink-0">
                    <Mail className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-primary">Official Email</p>
                    <p className="truncate text-xs text-muted-foreground group-hover:text-foreground">team@balochdev.com</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* ========================================================
              RIGHT COLUMN: Multi-Step Registration Form Card
             ======================================================== */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-8 shadow-xl">
              {/* Stepper Header */}
              <div className="border-b border-border pb-6 mb-6">
                <nav aria-label="Registration Progress">
                  <ol className="flex items-center justify-between gap-2">
                    {STEPS.map((s, index) => {
                      const Icon = s.icon;
                      const isCurrent = index === step;
                      const isComplete = index < step;
                      const isClickable = index <= step;

                      return (
                        <li key={s.id} className="flex-1">
                          <button
                            type="button"
                            onClick={() => handleStepClick(index)}
                            disabled={!isClickable}
                            className={cn(
                              'group flex w-full flex-col items-center gap-1.5 text-center transition-all',
                              isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                            )}
                          >
                            <div className="flex w-full items-center">
                              <span
                                className={cn(
                                  'h-0.5 flex-1 transition-colors',
                                  index === 0 ? 'invisible' : isComplete ? 'bg-primary' : 'bg-border'
                                )}
                              />
                              <span
                                className={cn(
                                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-all shadow-xs',
                                  isComplete
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : isCurrent
                                    ? 'border-primary bg-primary/10 text-primary ring-4 ring-primary/15'
                                    : 'border-border bg-muted text-muted-foreground'
                                )}
                              >
                                {isComplete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                              </span>
                              <span
                                className={cn(
                                  'h-0.5 flex-1 transition-colors',
                                  index === STEPS.length - 1 ? 'invisible' : isComplete ? 'bg-primary' : 'bg-border'
                                )}
                              />
                            </div>
                            <div className="mt-1 hidden sm:block">
                              <p
                                className={cn(
                                  'text-xs font-semibold',
                                  isCurrent ? 'text-primary' : isComplete ? 'text-foreground' : 'text-muted-foreground'
                                )}
                              >
                                {s.label}
                              </p>
                              <p className="text-[0.68rem] text-muted-foreground">{s.shortDesc}</p>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </nav>

                <div className="mt-4 text-center sm:hidden">
                  <p className="text-xs font-semibold text-primary">
                    Step {step + 1} of {STEPS.length}: {STEPS[step].label}
                  </p>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
                {/* ─────────────────────────────────────────────────────────────
                    STEP 1: LIBRARY INFORMATION
                   ───────────────────────────────────────────────────────────── */}
                {step === 0 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" /> Library Information
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Enter your library location and facilities. Required fields are marked with an asterisk (*).
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Library name"
                        htmlFor="lib-name"
                        required
                        error={errors.library?.name?.message}
                        className="sm:col-span-2"
                      >
                        <Input
                          id="lib-name"
                          {...register('library.name')}
                          error={errors.library?.name}
                          placeholder="e.g. Al-Hikmah Reading Room & Study Center"
                        />
                      </Field>

                      <Field
                        label="Street address"
                        htmlFor="lib-address"
                        required
                        error={errors.library?.address?.message}
                        className="sm:col-span-2"
                      >
                        <Input
                          id="lib-address"
                          {...register('library.address')}
                          error={errors.library?.address}
                          placeholder="e.g. Suite 402, 3rd Floor, Commercial Area"
                        />
                      </Field>

                      <Field label="City" htmlFor="lib-city" required error={errors.library?.city?.message}>
                        <Input
                          id="lib-city"
                          {...register('library.city')}
                          error={errors.library?.city}
                          placeholder="e.g. Lahore / Karachi / Islamabad"
                        />
                      </Field>

                      <Field label="Province / State" htmlFor="lib-province" error={errors.library?.province?.message}>
                        <Input
                          id="lib-province"
                          {...register('library.province')}
                          placeholder="e.g. Punjab / Sindh / Federal"
                        />
                      </Field>

                      <Field
                        label="Contact number"
                        htmlFor="lib-phone"
                        required
                        error={errors.library?.phone?.message}
                        hint="Public contact number for inquiries"
                      >
                        <Input
                          id="lib-phone"
                          inputMode="tel"
                          {...register('library.phone')}
                          error={errors.library?.phone}
                          placeholder="e.g. 0300 1234567"
                        />
                      </Field>

                      <Field
                        label="Library email"
                        htmlFor="lib-email"
                        required
                        error={errors.library?.email?.message}
                        hint="Official email of the library"
                      >
                        <Input
                          id="lib-email"
                          type="email"
                          {...register('library.email')}
                          error={errors.library?.email}
                          placeholder="e.g. info@alhikmahlibrary.com"
                        />
                      </Field>

                      <Field label="Library type" htmlFor="lib-type" required>
                        <Select
                          defaultValue={selectedType || 'reading_room'}
                          onValueChange={(value) => setValue('library.libraryType', value, { shouldValidate: true })}
                        >
                          <SelectTrigger id="lib-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LIBRARY_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>

                      <Field
                        label="Number of seats"
                        htmlFor="lib-seats"
                        required
                        error={errors.library?.seatCapacity?.message}
                        hint="Total physical seats available"
                      >
                        <Input
                          id="lib-seats"
                          type="number"
                          min={1}
                          max={5000}
                          {...register('library.seatCapacity')}
                          error={errors.library?.seatCapacity}
                          placeholder="e.g. 50"
                        />
                      </Field>

                      <Field
                        label="Opening time"
                        htmlFor="lib-open"
                        required
                        error={errors.library?.openingTime?.message}
                      >
                        <Input
                          id="lib-open"
                          type="time"
                          {...register('library.openingTime')}
                          error={errors.library?.openingTime}
                        />
                      </Field>

                      <Field
                        label="Closing time"
                        htmlFor="lib-close"
                        required
                        error={errors.library?.closingTime?.message}
                      >
                        <Input
                          id="lib-close"
                          type="time"
                          {...register('library.closingTime')}
                          error={errors.library?.closingTime}
                        />
                      </Field>

                      <Field
                        label="Short description (optional)"
                        htmlFor="lib-desc"
                        className="sm:col-span-2"
                        hint="Shown in the public library directory for prospective students"
                      >
                        <Textarea
                          id="lib-desc"
                          rows={2}
                          {...register('library.description')}
                          placeholder="Quiet study atmosphere with high-speed fiber Wi-Fi, air conditioning, lockers, and discussion areas."
                        />
                      </Field>
                    </div>
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    STEP 2: ACCOUNT INFORMATION
                   ───────────────────────────────────────────────────────────── */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <UserRound className="h-5 w-5 text-primary" /> Account Information
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        These credentials will serve as your primary administrator account for the librarian dashboard.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Full name"
                        htmlFor="librarian-name"
                        required
                        error={errors.librarian?.name?.message}
                        className="sm:col-span-2"
                      >
                        <Input
                          id="librarian-name"
                          autoComplete="name"
                          {...register('librarian.name')}
                          error={errors.librarian?.name}
                          placeholder="e.g. Muhammad Imran Khan"
                        />
                      </Field>

                      <Field
                        label="Personal phone number"
                        htmlFor="librarian-phone"
                        required
                        error={errors.librarian?.phone?.message}
                        hint="Used for account security & verification"
                      >
                        <Input
                          id="librarian-phone"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          {...register('librarian.phone')}
                          error={errors.librarian?.phone}
                          placeholder="e.g. 0300 9876543"
                        />
                      </Field>

                      <Field
                        label="Email address (Login username)"
                        htmlFor="librarian-email"
                        required
                        error={errors.librarian?.email?.message}
                        hint="You will use this email to sign in"
                      >
                        <Input
                          id="librarian-email"
                          type="email"
                          autoComplete="email"
                          {...register('librarian.email')}
                          error={errors.librarian?.email}
                          placeholder="e.g. imran@example.com"
                        />
                      </Field>

                      <Field
                        label="Password"
                        htmlFor="librarian-password"
                        required
                        error={errors.librarian?.password?.message}
                        hint="Minimum 8 characters with at least one letter and one number"
                      >
                        <div className="relative">
                          <Input
                            id="librarian-password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            {...register('librarian.password')}
                            error={errors.librarian?.password}
                            className="pr-10"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </Field>

                      <Field
                        label="Confirm password"
                        htmlFor="librarian-confirm-password"
                        required
                        error={errors.librarian?.confirmPassword?.message}
                        hint="Must match your chosen password"
                      >
                        <div className="relative">
                          <Input
                            id="librarian-confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            {...register('librarian.confirmPassword')}
                            error={errors.librarian?.confirmPassword}
                            className="pr-10"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </Field>

                      <div className="sm:col-span-2">
                        <Alert tone="info" icon>
                          Keep your login credentials confidential. {brand.name} administrators will never request your
                          password.
                        </Alert>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    STEP 3: REVIEW & SUBMIT
                   ───────────────────────────────────────────────────────────── */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" /> Review Application
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Please review the entered details carefully. You can go back to edit any section.
                      </p>
                    </div>

                    {/* Summary Card 1: Library Info */}
                    <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-border/60 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5" /> Library Details
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setStep(0)}
                          className="h-7 text-xs text-primary hover:text-primary"
                        >
                          <Pencil className="h-3 w-3 mr-1" /> Edit
                        </Button>
                      </div>

                      <div className="grid gap-2.5 sm:grid-cols-2 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Library Name</p>
                          <p className="font-semibold text-foreground">{currentValues.library?.name || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="font-semibold text-foreground">
                            {currentValues.library?.city}
                            {currentValues.library?.province ? `, ${currentValues.library.province}` : ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Full Address</p>
                          <p className="font-medium text-foreground">{currentValues.library?.address || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Seat Capacity & Type</p>
                          <p className="font-medium text-foreground">
                            {seatCapacity} Seats ·{' '}
                            {LIBRARY_TYPES.find((t) => t.value === currentValues.library?.libraryType)?.label ||
                              'Reading Room'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Contact Phone</p>
                          <p className="font-medium text-foreground">{currentValues.library?.phone || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Operating Hours</p>
                          <p className="font-medium text-foreground">
                            {currentValues.library?.openingTime} – {currentValues.library?.closingTime}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Summary Card 2: Account Info */}
                    <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-border/60 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <UserRound className="h-3.5 w-3.5" /> Librarian Account
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setStep(1)}
                          className="h-7 text-xs text-primary hover:text-primary"
                        >
                          <Pencil className="h-3 w-3 mr-1" /> Edit
                        </Button>
                      </div>

                      <div className="grid gap-2.5 sm:grid-cols-2 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Librarian Name</p>
                          <p className="font-semibold text-foreground">{currentValues.librarian?.name || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Personal Phone</p>
                          <p className="font-semibold text-foreground">{currentValues.librarian?.phone || '—'}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-xs text-muted-foreground">Login Email</p>
                          <p className="font-semibold text-foreground">{currentValues.librarian?.email || '—'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Terms & Conditions Acceptance */}
                    <div className="space-y-2">
                      <label className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4.5 w-4.5 rounded border-border text-primary focus:ring-primary"
                          {...register('termsAccepted')}
                        />
                        <span className="text-xs leading-relaxed text-muted-foreground">
                          I confirm that the submitted details are accurate and that I have authority to register this
                          library. I accept the{' '}
                          <Link to="/terms" target="_blank" className="font-semibold text-primary hover:underline">
                            Terms &amp; Conditions
                          </Link>{' '}
                          and{' '}
                          <Link to="/privacy" target="_blank" className="font-semibold text-primary hover:underline">
                            Privacy Policy
                          </Link>
                          . I understand my library account will begin in a <strong>pending verification</strong> state
                          until approved by platform administrators.
                        </span>
                      </label>
                      {errors.termsAccepted && (
                        <p className="text-xs font-medium text-destructive">{errors.termsAccepted.message}</p>
                      )}
                    </div>

                    {/* API Submission Error */}
                    {mutation.isError && (
                      <Alert tone="destructive" title="Registration failed">
                        {mutation.error?.message || 'Could not complete registration. Please verify details and retry.'}
                      </Alert>
                    )}
                  </div>
                )}

                {/* Form Navigation Controls */}
                <div className="flex items-center justify-between gap-3 border-t border-border pt-6 mt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setStep((s) => Math.max(0, s - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={step === 0 || mutation.isPending}
                  >
                    <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
                  </Button>

                  {step < STEPS.length - 1 ? (
                    <Button
                      type="button"
                      onClick={() => validateAndProceed(step + 1)}
                      className="min-w-[130px]"
                    >
                      Continue <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      loading={mutation.isPending}
                      disabled={mutation.isPending}
                      className="min-w-[190px]"
                    >
                      Submit application <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
