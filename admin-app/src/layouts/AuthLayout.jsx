import { Outlet } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Database, BarChart3 } from 'lucide-react';
import { Logo } from '../components/common/Logo.jsx';
import { ThemeToggle } from '../components/common/ThemeToggle.jsx';
import { useSettings } from '../hooks/useSettings.js';

const ADMIN_HIGHLIGHTS = [
  { icon: ShieldCheck, title: 'Multi-Tenant Security', text: 'Central control with strict tenant isolation across all registered libraries.' },
  { icon: Database, title: 'Centralized Administration', text: 'Approve, suspend, and configure libraries, pricing, and system parameters.' },
  { icon: BarChart3, title: 'Revenue & Audit Tracking', text: 'Real-time billing, subscription sweeps, transaction logs, and security audits.' },
];

/** Dedicated split-screen auth shell for Platform Administration. */
export const AuthLayout = ({ title, subtitle, footer }) => {
  const { brand } = useSettings();
  const publicUrl = import.meta.env.VITE_PUBLIC_URL || 'http://localhost:5173';

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
          <Logo inverted brandName={`${brand.name || 'LibraDesk'} Admin`} />
        </div>

        <div className="relative max-w-md space-y-6">
          <h2 className="text-3xl font-semibold leading-tight">
            Centralized Platform Administration & Governance
          </h2>
          <ul className="space-y-4">
            {ADMIN_HIGHLIGHTS.map(({ icon: Icon, title: itemTitle, text }) => (
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
          Restricted access. All administrative actions and sessions are audited and recorded.
        </div>
      </aside>

      <main className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <div className="lg:hidden">
            <Logo brandName={`${brand.name || 'LibraDesk'} Admin`} />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <a
              href={publicUrl}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back to main website
            </a>
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
