import { motion } from 'framer-motion';
import { BadgeCheck, Building2, CalendarClock, CreditCard } from 'lucide-react';
import { SectionHeading } from '../common/SectionHeading.jsx';
import { useSettings } from '../../hooks/useSettings.js';
import { formatMoney } from '../../utils/format.js';

const StepIcon = ({ icon: Icon, tone }) => (
  <span className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card shadow-sm ${tone}`}>
    <Icon className="h-6 w-6" aria-hidden="true" />
  </span>
);

export const HowItWorks = () => {
  const { subscription } = useSettings();

  const steps = [
    {
      icon: Building2,
      title: 'Register your library',
      text: 'Add your library details, seats and timings. Takes under three minutes — no payment details needed.',
      tone: 'text-primary',
    },
    {
      icon: BadgeCheck,
      title: 'Admin reviews your application',
      text: 'Our team verifies your registration and approves the account, usually within one working day.',
      tone: 'text-info',
    },
    {
      icon: CalendarClock,
      title: `Start your ${subscription.trialMonths}-month free trial`,
      text: 'Your dashboard opens with every module unlocked. Import students, map seats and record fees immediately.',
      tone: 'text-success',
    },
    {
      icon: CreditCard,
      title: 'Continue with your subscription',
      text: `After the trial, continue for ${formatMoney(subscription.priceMonthly, subscription)} per month. Cancel any time — your data always stays yours.`,
      tone: 'text-accent',
    },
  ];

  return (
    <section id="for-libraries" className="section" aria-labelledby="how-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title={<span id="how-heading">From registration to a running library in four steps</span>}
          description="No installation, no training days, no IT department. Everything runs in the browser."
        />

        <ol className="relative mt-14 grid gap-8 lg:grid-cols-4 lg:gap-6">
          {/* Connector line (desktop) */}
          <span className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block" aria-hidden="true" />

          {steps.map((step, index) => (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-70px' }}
              transition={{ duration: 0.55, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col gap-4 lg:items-start"
            >
              <div className="flex items-center gap-3">
                <StepIcon icon={step.icon} tone={step.tone} />
                <span className="font-mono text-sm text-muted-foreground">STEP {index + 1}</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
};
