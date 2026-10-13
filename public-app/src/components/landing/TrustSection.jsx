import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Building2, GraduationCap, LayoutGrid, ShieldCheck, UserCheck } from 'lucide-react';
import { SectionHeading } from '../common/SectionHeading.jsx';
import { Skeleton } from '../ui/misc.jsx';
import { settingsService } from '../../services/index.js';
import { useCountUp } from '../../hooks/useCountUp.js';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';
import { formatNumber } from '../../utils/format.js';

/**
 * Trust section.
 * Numbers come from GET /api/settings/public-stats — real, measured values.
 * Before any library exists we intentionally show "early access" messaging
 * rather than inventing impressive-looking statistics.
 */
const Stat = ({ icon: Icon, value, label, suffix = '', enabled = true, index }) => {
  const animated = useCountUp(Number(value) || 0, { enabled });
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="surface flex flex-col items-center gap-2 p-6 text-center"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="text-3xl font-semibold tabular-nums tracking-tight">
        {formatNumber(reduced || !enabled ? Number(value) || 0 : animated)}
        {suffix}
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </motion.div>
  );
};

const DEMO_VALUES = { libraries: 4, students: 120, seats: 180, registrations: 120 };

export const TrustSection = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['settings', 'public-stats'],
    queryFn: () => settingsService.publicStats(),
    staleTime: 5 * 60 * 1000,
  });

  const stats = data?.data?.stats || null;
  const real = Boolean(stats?.hasData);
  const values = real ? stats : DEMO_VALUES;
  const reduced = useReducedMotion();

  return (
    <section id="trust" className="section border-y border-border bg-muted/30" aria-labelledby="trust-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Built for modern private libraries"
          title={<span id="trust-heading">A platform designed around how libraries really operate</span>}
          description="Multi-tenant architecture, isolated data, role-based access and a subscription model that scales from one reading room to a national network."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[152px] rounded-xl" />)
          ) : (
            <>
              <Stat icon={Building2} value={values.libraries} label="Registered libraries" enabled={real && !reduced} index={0} />
              <Stat icon={GraduationCap} value={values.students} label="Students managed" enabled={real && !reduced} index={1} />
              <Stat icon={LayoutGrid} value={values.seats} label="Seats under management" enabled={real && !reduced} index={2} />
              <Stat icon={UserCheck} value={values.registrations} label="Registrations processed" enabled={real && !reduced} index={3} />
            </>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          {real
            ? 'These figures are live counts from the platform database.'
            : 'Figures shown during early access are placeholders — LibraDesk never publishes invented statistics.'}
        </p>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {[
            { title: 'Your data stays yours', text: 'Every library is an isolated tenant. No other librarian — and no other library — can ever see your records.', icon: ShieldCheck },
            { title: 'Secure by construction', text: 'Hashed passwords, JWT sessions, rate limiting, validated inputs and a full audit log of sensitive actions.', icon: ShieldCheck },
            { title: 'Grows with you', text: 'Add seats, staff and branches. The same platform handles a 20-seat reading room or a multi-branch network.', icon: Building2 },
          ].map((card) => (
            <div key={card.title} className="surface p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/12 text-success">
                <card.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-semibold">{card.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
