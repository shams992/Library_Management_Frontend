import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MessagesSquare } from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { useSettings } from '../../hooks/useSettings.js';

export const FinalCTA = () => {
  const { subscription } = useSettings();
  const monthsWord = `${subscription.trialMonths} month${subscription.trialMonths === 1 ? '' : 's'}`;

  return (
    <section className="relative overflow-hidden py-20 sm:py-24" aria-labelledby="cta-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-slate-950 px-6 py-14 text-center sm:px-12"
        >
          <div className="pointer-events-none absolute inset-0 opacity-[0.18]" aria-hidden="true">
            <svg className="h-full w-full" viewBox="0 0 900 400" fill="none" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="ctaGrid" width="46" height="46" patternUnits="userSpaceOnUse">
                  <path d="M46 0H0v46" stroke="white" strokeOpacity=".35" />
                </pattern>
              </defs>
              <rect width="900" height="400" fill="url(#ctaGrid)" />
            </svg>
          </div>
          <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-primary/30 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />

          <div className="relative mx-auto max-w-2xl space-y-5">
            <span className="eyebrow border-white/20 bg-white/10 text-white/80">Get started today</span>
            <h2 id="cta-heading" className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Ready to Manage Your Library Smarter?
            </h2>
            <p className="text-base text-white/70">
              Start your library&apos;s first {monthsWord} free — every module unlocked, no card required. Your seat map, fee
              register and profit report can be live today.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button asChild size="lg" className="min-w-[200px]">
                <Link to="/register">
                  Register Your Library <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <Link to="/contact">
                  <MessagesSquare className="h-4 w-4" /> Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
