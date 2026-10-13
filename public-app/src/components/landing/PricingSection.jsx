import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, HelpCircle, Sparkles } from 'lucide-react';
import { SectionHeading } from '../common/SectionHeading.jsx';
import { Button } from '../ui/button.jsx';
import { Badge } from '../ui/badge.jsx';
import { useSettings } from '../../hooks/useSettings.js';
import { formatMoney } from '../../utils/format.js';

const INCLUDED = [
  'Unlimited student records',
  'Visual seat map & seat history',
  'Monthly fee invoicing + reminders',
  'Employee, salary & attendance modules',
  'Expenses, income and profit tracking',
  '11 ready-made reports with CSV export',
  'Student portal for your members',
  'Direct messaging with platform support',
];

export const PricingSection = () => {
  const { subscription, registration } = useSettings();

  const monthly = Number(subscription.priceMonthly || 1000);
  const yearly = Number(subscription.priceYearly || 10000);
  const registrationFee = Number(subscription.registrationFee || 2000);
  const yearlySaving = monthly * 12 - yearly;

  return (
    <section id="pricing" className="section" aria-labelledby="pricing-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Simple pricing"
          title={<span id="pricing-heading">Start free. Pay only when your library is running.</span>}
          description={`New libraries get ${subscription.trialMonths} full month${subscription.trialMonths === 1 ? '' : 's'} free with every module unlocked — one-time library registration fee ${formatMoney(registrationFee, subscription)}, then ${formatMoney(monthly, subscription)}/month.`}
        />

        <div className="mx-auto mt-12 grid max-w-4xl gap-5 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="relative rounded-3xl border border-white/80 bg-white/80 p-7 sm:p-8 shadow-[0_12px_35px_-10px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80"
          >
            <Badge tone="default" className="absolute right-6 top-6 rounded-full px-3 py-1">Monthly Plan</Badge>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Monthly library subscription</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">{formatMoney(monthly, subscription)}</span>
              <span className="pb-1 text-sm font-medium text-slate-500">/ month</span>
            </div>
            <p className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              Library registration: {formatMoney(registrationFee, subscription)} one-time
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Billed every {subscription.billingCycleMonths} month{subscription.billingCycleMonths > 1 ? 's' : ''} after your 1 month free trial. Includes a{' '}
              {subscription.gracePeriodDays}-day grace period before any suspension — and your data is never deleted.
            </p>

            <ul className="mt-6 space-y-2.5">
              {INCLUDED.map((featureItem) => (
                <li key={featureItem} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                  {featureItem}
                </li>
              ))}
            </ul>

            <Button asChild size="lg" className="mt-8 w-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35">
              <Link to="/register">
                Register Your Library <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {registration.requireAdminApproval ? 'Admin approval required — usually within one working day.' : 'Instant activation.'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="space-y-4"
          >
            <div className="rounded-3xl border border-white/80 bg-white/80 p-7 shadow-[0_12px_35px_-10px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Your first {subscription.trialMonths} {subscription.trialMonths === 1 ? 'month' : 'months'}</p>
              </div>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Free</span>
                <span className="pb-1 text-sm font-medium text-slate-500">· 1 month full access</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Enjoy a 1-month free trial with full access. After the first month, your library subscription is {formatMoney(monthly, subscription)}/month. If you decide not to continue, nothing is charged and no card is needed to start.
              </p>
            </div>

            <div className="rounded-3xl border border-white/80 bg-white/80 p-7 shadow-[0_12px_35px_-10px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Prefer annual billing?</p>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{formatMoney(yearly, subscription)}</span>
                <span className="pb-1 text-sm font-medium text-slate-500">/ year</span>
              </div>
              {yearlySaving > 0 ? (
                <p className="mt-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  Saves {formatMoney(yearlySaving, subscription)} compared with monthly billing.
                </p>
              ) : null}
              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                Annual pricing is configured by platform administration and can be tailored for multi-branch libraries.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white flex items-start gap-3 p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                Questions about pricing, branches or data migration from your current registers?{' '}
                <Link to="/contact" className="font-medium text-primary hover:underline">Talk to us</Link>.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
