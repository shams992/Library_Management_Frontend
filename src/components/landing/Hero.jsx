import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Armchair,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  PlayCircle,
  Receipt,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { DashboardMockup } from './DashboardMockup.jsx';
import { useSettings } from '../../hooks/useSettings.js';
import { formatMoney } from '../../utils/format.js';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';

const container = {
  hidden: { opacity: 1 },
  show: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const FloatingCard = ({ className, icon: Icon, label, value, tone }) => (
  <motion.div
    initial={{ opacity: 0, y: 14, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay: 0.7, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    className={`pointer-events-none absolute z-10 hidden items-center gap-2.5 rounded-xl border border-border bg-card/95 px-3.5 py-2.5 shadow-md backdrop-blur lg:flex ${className}`}
  >
    <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}>
      <Icon className="h-4 w-4" />
    </span>
    <div className="leading-tight">
      <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold tabular-nums">{value}</p>
    </div>
  </motion.div>
);

export const Hero = () => {
  const { subscription, brand } = useSettings();
  const reduced = useReducedMotion();

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });

  return (
    <section className="relative overflow-hidden pb-16 pt-14 sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-24" aria-labelledby="hero-heading">
      {/* Background: subtle grid + radial wash + one soft orb. Deliberately restrained. */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-grid-light bg-grid opacity-[0.35] [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
        <div className="absolute inset-x-0 top-0 h-[520px] bg-radial-fade" />
        <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_1fr] lg:gap-10">
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-2xl">
            <motion.div variants={item} className="flex flex-wrap items-center gap-2">
              <span className="eyebrow">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                {subscription.trialMonths} {subscription.trialMonths === 1 ? 'month' : 'months'} free · no card required
              </span>
            </motion.div>

            <motion.h1 variants={item} id="hero-heading" className="display-heading mt-6">
              Manage Your Library.
              <span className="block text-primary">Grow Your Business.</span>
            </motion.h1>

            <motion.p variants={item} className="lede mt-5 max-w-xl">
              A complete management platform for private libraries — students, seats, fees, employees, expenses and
              profits in one place. Built for owners who want to run on numbers, not notebooks.
            </motion.p>

            <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="min-w-[190px]">
                <Link to="/register">
                  Register Your Library <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollTo('how-it-works')}>
                <PlayCircle className="h-4 w-4" /> See How It Works
              </Button>
            </motion.div>

            <motion.dl variants={item} className="mt-9 grid max-w-lg grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              {[
                { icon: Users, label: 'Students', value: 'Unlimited records' },
                { icon: Armchair, label: 'Seats', value: 'Visual seat map' },
                { icon: Receipt, label: 'Fees', value: 'Auto reminders' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <Icon className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
                  <div>
                    <dt className="text-[0.68rem] uppercase tracking-wide text-muted-foreground">{label}</dt>
                    <dd className="text-sm font-medium">{value}</dd>
                  </div>
                </div>
              ))}
            </motion.dl>

            <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5 text-success" /> Isolated data per library</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-success" /> Secure, role-based access</span>
              <span className="inline-flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5 text-success" /> Live in minutes</span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="relative"
          >
            <div className="relative rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-accent/10 p-2">
              <DashboardMockup />
            </div>

            <FloatingCard
              className="-left-6 top-24"
              icon={Armchair}
              label="Seats free"
              value="36 of 120"
              tone="bg-success/12 text-success"
            />
            <FloatingCard
              className="-right-4 bottom-16"
              icon={ReceiptText}
              label="Collected this month"
              value={formatMoney(128400, subscription, { compact: true })}
              tone="bg-primary-soft text-primary"
            />
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-12 text-center text-xs text-muted-foreground"
        >
          {brand.tagline} · Packages from {formatMoney(subscription.priceMonthly, subscription)} per month after the free trial
        </motion.p>
      </div>
    </section>
  );
};
