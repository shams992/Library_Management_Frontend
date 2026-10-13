import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Compass, HeartHandshake, ShieldCheck, Target, Users } from 'lucide-react';
import { SectionHeading } from '../../components/common/SectionHeading.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Card } from '../../components/ui/card.jsx';
import { useSettings } from '../../hooks/useSettings.js';

const VALUES = [
  { icon: Target, title: 'Built for owners, not accountants', text: 'Every screen answers a question a library owner asks daily: who is sitting where, who has paid, what did I earn this month?' },
  { icon: ShieldCheck, title: 'Your records are safe', text: 'Data is stored in the cloud, isolated per library and never deleted — even if a subscription lapses.' },
  { icon: HeartHandshake, title: 'Honest software', text: 'No inflated statistics, no fake dashboards, no hidden fees. What you see in the product is what it does.' },
  { icon: Compass, title: 'Simple by default', text: 'If a feature needs a manual, it is designed wrong. Everything important is one or two clicks from the dashboard.' },
];

export default function AboutPage() {
  const { brand, subscription } = useSettings();

  return (
    <div>
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="About us"
            title={`Why ${brand.name} exists`}
            description="Private libraries are small businesses with none of the tools small businesses expect. We build the software we wished existed when we ran one."
          />
        </div>
      </section>

      <section className="section">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="space-y-5">
            <h2 className="text-2xl font-semibold tracking-tight">The problem we kept seeing</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Thousands of private reading rooms, study halls and lending libraries run on paper: a register for students, a
              notebook for fees, a diary for expenses and staff salaries. It works — until it doesn&apos;t. A register gets lost,
              a payment is disputed, a seat is double-booked, and at the end of the month nobody can say with confidence
              whether the library actually made money.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Spreadsheets help, but they do not know that a seat can only hold one student, that an unpaid invoice should
              raise a reminder, or that paying a salary is also an expense. Those rules belong in software — that is exactly
              what {brand.name} encodes.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {[{ label: 'Libraries on one platform', value: 'Unlimited tenants' }, { label: 'Modules per library', value: 'Every module included' }, { label: 'Trial for new libraries', value: `${subscription.trialMonths} ${subscription.trialMonths === 1 ? 'month' : 'months'} free` }, { label: 'Data ownership', value: 'Always yours' }].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-sm font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <Card key={title} className="flex gap-4 p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section border-y border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Who it is for"
            title="Libraries of every size, on one platform"
            description="Every library registers independently, gets its own isolated workspace and manages its own students, staff and finances."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Building2, title: 'Reading rooms & study halls', text: 'Seat-first operations: occupancy, monthly fees, shift planning and quiet-zone management.' },
              { icon: Users, title: 'Lending libraries', text: 'Member records, dues tracking and staff management for libraries that lend materials.' },
              { icon: Target, title: 'Multi-branch owners', text: 'Run several libraries on the same platform with separate dashboards and consolidated reporting.' },
            ].map(({ icon: Icon, title, text }) => (
              <Card key={title} className="p-6">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="mt-4 text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Our vision</h2>
          <p className="lede mt-4">
            A private library should be able to see, in one glance, how many seats are filled, how much money is outstanding
            and whether the month ended in profit. We want every librarian — from a 20-seat reading room to a
            multi-branch network — to run on numbers instead of guesswork.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/register">Register your library <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/contact">Talk to us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

