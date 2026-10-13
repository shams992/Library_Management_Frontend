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
            className="relative surface border-primary/30 p-7 shadow-glow"
          >
            <Badge tone="info" className="absolute right-5 top-5">Monthly Plan</Badge>
            <p className="text-sm font-medium text-muted-foreground">Monthly library subscription</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-4xl font-semibold tracking-tight">{formatMoney(monthly, subscription)}</span>
              <span className="pb-1 text-sm text-muted-foreground">/ month</span>
            </div>
            <p className="mt-2 text-xs font-semibold text-primary">
              Library registration: {formatMoney(registrationFee, subscription)} one-time
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Billed every {subscription.billingCycleMonths} month{subscription.billingCycleMonths > 1 ? 's' : ''} after your 1 month free trial. Includes a{' '}
              {subscription.gracePeriodDays}-day grace period before any suspension — and your data is never deleted.
            </p>

            <ul className="mt-6 space-y-2.5">
              {INCLUDED.map((featureItem) => (
                <li key={featureItem} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                  {featureItem}
                </li>
              ))}
            </ul>

            <Button asChild size="lg" className="mt-7 w-full">
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
            <div className="surface p-7">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <p className="text-sm font-medium text-muted-foreground">Your first {subscription.trialMonths} {subscription.trialMonths === 1 ? 'month' : 'months'}</p>
              </div>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-4xl font-semibold tracking-tight">Free</span>
                <span className="pb-1 text-sm text-muted-foreground">· 1 month full access</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Enjoy a 1-month free trial with full access. After the first month, your library subscription is {formatMoney(monthly, subscription)}/month. If you decide not to continue, nothing is charged and no card is needed to start.
              </p>
            </div>

            <div className="surface p-7">
              <p className="text-sm font-medium text-muted-foreground">Prefer annual billing?</p>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-3xl font-semibold tracking-tight">{formatMoney(yearly, subscription)}</span>
                <span className="pb-1 text-sm text-muted-foreground">/ year</span>
              </div>
              {yearlySaving > 0 ? (
                <p className="mt-2 text-sm text-success">
                  Saves {formatMoney(yearlySaving, subscription)} compared with monthly billing.
                </p>
              ) : null}
              <p className="mt-4 text-xs text-muted-foreground">
                Annual pricing is configured by platform administration and can be tailored for multi-branch libraries.
              </p>
            </div>

            <div className="surface flex items-start gap-3 p-5">
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
