import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, LayoutDashboard, LogIn, Menu, X } from 'lucide-react';
import { Logo } from '../common/Logo.jsx';
import { ThemeToggle } from '../common/ThemeToggle.jsx';
import { Button } from '../ui/button.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useSettings } from '../../hooks/useSettings.js';
import { PORTAL_ROOT } from '../../utils/navigation.js';
import { cn } from '../../utils/cn.js';

const LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Libraries', to: '/libraries' },
  { label: 'How It Works', to: '/#how-it-works' },
  { label: 'Pricing', to: '/#pricing' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { isAuthenticated, role } = useAuth();
  const { brand } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname, location.hash]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const go = (to) => {
    setOpen(false);
    if (to.includes('#')) {
      const [path, hash] = to.split('#');
      if (location.pathname === (path || '/')) {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    navigate(to);
  };

  const isLinkActive = (to) => {
    if (to === '/') return location.pathname === '/' && !location.hash;
    if (to.startsWith('/#')) return location.hash === to.substring(1);
    return location.pathname.startsWith(to);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'border-b border-white/70 bg-white/80 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/85'
          : 'border-b border-white/40 bg-white/65 backdrop-blur-lg dark:border-slate-800/40 dark:bg-slate-950/65'
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo brandName={brand.name} />

        <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">
          {LINKS.map((link) => {
            const active = isLinkActive(link.to);
            return (
              <button
                key={link.label}
                type="button"
                onClick={() => go(link.to)}
                className={cn(
                  'relative py-1.5 px-3 text-[14px] font-medium transition-all rounded-full',
                  active
                    ? 'font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
                )}
              >
                {link.label}
                {active ? (
                  <span className="absolute -bottom-1 left-1/2 h-[3px] w-5 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400" />
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <Button asChild size="sm" className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-white shadow-md shadow-indigo-500/25 hover:from-blue-700 hover:to-indigo-700">
              <Link to={PORTAL_ROOT[role] || '/'}>
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-xs backdrop-blur-md transition-all hover:bg-white hover:text-slate-900 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <LogIn className="h-4 w-4 text-slate-500" /> Login
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                Register Library <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-border bg-background/98 backdrop-blur-xl lg:hidden"
          >
            <nav aria-label="Mobile navigation" className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
              <ul className="space-y-1">
                {LINKS.map((link, index) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 * index, duration: 0.24 }}
                  >
                    <button
                      type="button"
                      onClick={() => go(link.to)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-[0.95rem] font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      {link.label}
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                {isAuthenticated ? (
                  <Button asChild className="w-full">
                    <Link to={PORTAL_ROOT[role] || '/'}>Go to dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/login">Login to your library</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link to="/register">Register your library</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
};
