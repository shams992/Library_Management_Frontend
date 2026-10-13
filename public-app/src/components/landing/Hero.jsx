import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Armchair,
  ArrowRight,
  BarChart3,
  CreditCard,
  PlayCircle,
  Users,
  Zap,
} from 'lucide-react';
import { DashboardMockup } from './DashboardMockup.jsx';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';

const container = {
  hidden: { opacity: 1 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const TRUSTED_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80',
];

export const Hero = () => {
  const reduced = useReducedMotion();

  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });

  return (
    <section
      className="relative overflow-hidden pb-16 pt-24 sm:pb-20 sm:pt-28 lg:pb-24 lg:pt-32"
      aria-labelledby="hero-heading"
    >
      {/* Soft Ambient Background Wash matching reference image */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        {/* Soft Indigo / Violet diffuse orb on top right */}
        <div className="absolute -right-20 -top-20 h-[550px] w-[550px] rounded-full bg-gradient-to-br from-indigo-200/40 via-purple-100/30 to-transparent blur-3xl dark:from-indigo-900/20 dark:via-purple-900/10" />
        {/* Subtle radial wash on left */}
        <div className="absolute -left-20 top-40 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-blue-100/30 to-transparent blur-3xl dark:from-blue-900/15" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-10 xl:gap-14">
          {/* Left Column: Heading, Subtitle, CTAs, Social Proof */}
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-2xl">
            {/* Pill Tag */}
            <motion.div variants={item} className="flex items-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100/90 bg-indigo-50/80 px-3.5 py-1.5 text-xs font-semibold text-indigo-600 shadow-xs dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-400">
                <Zap className="h-3.5 w-3.5 fill-indigo-600 text-indigo-600 dark:fill-indigo-400 dark:text-indigo-400" />
                Smart Library Management
              </span>
            </motion.div>

            {/* Display Headline */}
            <motion.h1
              variants={item}
              id="hero-heading"
              className="mt-6 text-4xl sm:text-5xl lg:text-[3.8rem] xl:text-[4.2rem] font-black tracking-tight text-slate-900 dark:text-white leading-[1.08]"
            >
              Manage Your Library.
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Grow Your Business.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={item}
              className="mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-slate-500 dark:text-slate-400"
            >
              A simple and powerful platform for private libraries — track students, manage fees, and keep everything organized in one place.
            </motion.p>

            {/* CTA Buttons Row */}
            <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:from-indigo-700 hover:to-indigo-800 hover:shadow-xl hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0"
              >
                Register Your Library <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => scrollTo('how-it-works')}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-6 py-3.5 text-base font-semibold text-slate-800 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                <PlayCircle className="h-4.5 w-4.5 text-slate-700 dark:text-slate-300" /> See How It Works
              </button>
            </motion.div>

            {/* Social Proof Avatar Stack */}
            <motion.div variants={item} className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2 overflow-hidden">
                {TRUSTED_AVATARS.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt="User"
                    className="inline-block h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-900"
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Trusted by 1,000+ libraries
              </span>
            </motion.div>
          </motion.div>

          {/* Right Column: Device Laptop Mockup with Ambient accents */}
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="relative lg:pl-2"
          >
            <DashboardMockup />
          </motion.div>
        </div>

        {/* Feature Cards Floating Container across the Bottom of Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 sm:mt-20 rounded-3xl border border-white/80 bg-white/80 p-6 sm:p-7 shadow-[0_12px_35px_-10px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80"
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {/* 1. Student Management */}
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs dark:bg-indigo-950/70 dark:text-indigo-400">
                <Users className="h-6 w-6" />
              </div>
              <div className="min-w-0 leading-tight">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Student Management</h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Keep student data organized</p>
              </div>
            </div>

            {/* 2. Seat Tracking */}
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-500 shadow-xs dark:bg-sky-950/70 dark:text-sky-400">
                <Armchair className="h-6 w-6" />
              </div>
              <div className="min-w-0 leading-tight">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Seat Tracking</h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Know availability instantly</p>
              </div>
            </div>

            {/* 3. Fee Management */}
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs dark:bg-emerald-950/70 dark:text-emerald-400">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="min-w-0 leading-tight">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Fee Management</h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Track payments & dues</p>
              </div>
            </div>

            {/* 4. Reports & Insights */}
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 shadow-xs dark:bg-purple-950/70 dark:text-purple-400">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div className="min-w-0 leading-tight">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Reports & Insights</h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Make better decisions</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
