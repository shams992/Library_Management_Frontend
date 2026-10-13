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
  { label: 'Features', to: '/#features' },
  { label: 'How It Works', to: '/#how-it-works' },
  { label: 'Pricing', to: '/#pricing' },
  { label: 'Find a Library', to: '/libraries' },
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

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'border-b border-border/80 bg-background/85 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/70'
          : 'border-b border-transparent bg-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Logo brandName={brand.name} />

        <nav aria-label="Main navigation" className="mx-auto hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => go(link.to)}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                location.pathname === link.to && 'text-foreground'
              )}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
          <ThemeToggle />

          {isAuthenticated ? (
            <Button asChild size="sm" className="ml-1">
              <Link to={PORTAL_ROOT[role] || '/'}>
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/login">
                  <LogIn className="h-4 w-4" /> Login
                </Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link to="/register">
                  Register Library <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
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
