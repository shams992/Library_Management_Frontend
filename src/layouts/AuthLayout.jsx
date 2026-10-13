import { Link, Outlet } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { Logo } from '../components/common/Logo.jsx';
import { ThemeToggle } from '../components/common/ThemeToggle.jsx';
import { useSettings } from '../hooks/useSettings.js';

const HIGHLIGHTS = [
  { icon: BadgeCheck, title: 'Multi-tenant by design', text: 'Every library gets its own isolated workspace and data.' },
  { icon: ShieldCheck, title: 'Secure by default', text: 'Hashed passwords, JWT sessions and role-based access control.' },
  { icon: Sparkles, title: 'Live in minutes', text: 'Register, get approved and start managing the same day.' },
];

/** Split-screen auth shell: brand/story on the left, the form on the right. */
export const AuthLayout = ({ title, subtitle, footer }) => {
  const { brand, subscription } = useSettings();

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white lg:flex">
        <div className="pointer-events-none absolute inset-0 opacity-[0.16]" aria-hidden="true">
          <svg className="h-full w-full" viewBox="0 0 600 900" fill="none">
            <defs>
              <pattern id="authGrid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M48 0H0v48" stroke="white" strokeOpacity=".35" />
              </pattern>
            </defs>
            <rect width="600" height="900" fill="url(#authGrid)" />
          </svg>
        </div>
        <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-primary/30 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-16 bottom-10 h-64 w-64 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />

        <div className="relative">
          <Logo inverted brandName={brand.name} />
        </div>

        <div className="relative max-w-md space-y-6">
          <h2 className="text-3xl font-semibold leading-tight">
            One dashboard for students, seats, fees, staff and profit.
          </h2>
          <ul className="space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, title: itemTitle, text }) => (
              <li key={itemTitle} className="flex gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-sm font-medium">{itemTitle}</p>
                  <p className="text-sm text-white/60">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative text-sm text-white/60">
          New libraries get {subscription.trialMonths} {subscription.trialMonths === 1 ? 'month' : 'months'} free — then {subscription.currencySymbol}{' '}
          {Number(subscription.priceMonthly).toLocaleString()} / month.
        </div>
      </aside>

      <main className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <div className="lg:hidden">
            <Logo brandName={brand.name} />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back to site
            </Link>
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[26rem] space-y-7">
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
              {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
            </div>
            <Outlet />
            {footer}
          </div>
        </div>
      </main>
    </div>
  );
};
