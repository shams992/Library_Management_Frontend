import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  LayoutGrid,
  Send,
  GraduationCap,
  ArrowRight,
  ReceiptText,
  Bell,
  Search,
  CheckCircle2,
  Clock,
  Wifi,
  ShieldCheck,
} from 'lucide-react';
import { SectionHeading } from '../common/SectionHeading.jsx';
import { Button } from '../ui/button.jsx';
import { Badge } from '../ui/badge.jsx';

const JOURNEY_STEPS = [
  {
    step: '01',
    icon: Compass,
    title: 'Discover Libraries',
    description: 'Browse verified private libraries and study spaces by city, neighborhood, amenities, and timings.',
    badge: 'Discovery',
  },
  {
    step: '02',
    icon: LayoutGrid,
    title: 'Inspect Seats & Facilities',
    description: 'Review live seat availability, air-conditioned shifts, high-speed Wi-Fi, and transparent fee packages.',
    badge: 'Real-Time',
  },
  {
    step: '03',
    icon: Send,
    title: 'Submit Application',
    description: 'Send your enrollment request directly to the library administration in seconds without paper forms.',
    badge: 'Fast Approval',
  },
  {
    step: '04',
    icon: GraduationCap,
    title: 'Access Student Portal',
    description: 'Log in to manage your assigned seat, fee receipts, payment reminders, and administrative announcements.',
    badge: 'Personal Workspace',
  },
];

const STUDENT_BENEFITS = [
  {
    icon: LayoutGrid,
    title: 'Dedicated Seat Guarantee',
    description: 'Never worry about crowded rooms. Your assigned desk and shift are locked exclusively for your study hours.',
  },
  {
    icon: ReceiptText,
    title: 'Transparent Fee Tracking',
    description: 'Digital receipts for every payment. Clear records of monthly dues, payment dates, and zero hidden charges.',
  },
  {
    icon: Bell,
    title: 'Direct Library Notices',
    description: 'Receive real-time alerts about holiday timings, library maintenance, and important schedule updates.',
  },
  {
    icon: ShieldCheck,
    title: 'Peace of Mind Study Environment',
    description: 'Join verified study halls equipped with backup electricity, silent study protocols, and modern amenities.',
  },
];

export const StudentSection = () => {
  return (
    <section
      id="for-students"
      className="section scroll-mt-20 border-y border-border bg-slate-900/[0.02] dark:bg-slate-950/40"
      aria-labelledby="students-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="For Students & Aspirants"
          title={<span id="students-heading">Find Your Perfect Library & Study Space</span>}
          description="Built for competitive exam aspirants, university students, and focused professionals who need a quiet, dedicated desk."
        />

        {/* 4-Step Student Journey */}
        <div className="mt-14">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Student Journey</p>
              <h3 className="text-lg font-semibold text-foreground">How Students Join & Study with LibraDesk</h3>
            </div>
            <Badge tone="primary" variant="subtle" className="hidden sm:inline-flex">
              4 Easy Steps
            </Badge>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {JOURNEY_STEPS.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.45, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="surface surface-hover relative flex flex-col justify-between p-6 transition-all duration-300"
                >
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="font-mono text-xs font-semibold text-muted-foreground/70">{item.step}</span>
                    </div>
                    <Badge variant="outline" size="sm" className="mb-2 text-[11px]">
                      {item.badge}
                    </Badge>
                    <h4 className="text-base font-semibold text-foreground">{item.title}</h4>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Student Portal Features Showcase */}
        <div className="mt-12 rounded-3xl border border-white/80 bg-white/80 p-6 shadow-[0_12px_35px_-10px_rgba(0,0,0,0.04)] backdrop-blur-xl sm:p-8 lg:p-10 dark:border-white/10 dark:bg-slate-900/80">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Complete Student Dashboard
              </span>
              <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Everything you need to focus on your studies
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Once registered, access your dedicated student portal. Check your seat details, view paid receipts, and get notified about schedule adjustments right on your phone.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button asChild size="default" className="gap-2 shadow-sm">
                  <Link to="/libraries">
                    <Search className="h-4 w-4" /> Find a Library
                  </Link>
                </Button>
                <Button asChild variant="outline" size="default" className="gap-2">
                  <Link to="/login">
                    <GraduationCap className="h-4 w-4" /> Student Login
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
              {STUDENT_BENEFITS.map((benefit, i) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={benefit.title}
                    className="flex flex-col gap-2.5 rounded-xl border border-border/80 bg-background/60 p-4.5 transition-colors hover:border-primary/40"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{benefit.title}</h4>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
