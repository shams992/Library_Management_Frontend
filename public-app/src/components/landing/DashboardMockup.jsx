import { motion } from 'framer-motion';
import {
  Armchair, ArrowRight, Bell, Calendar, CalendarPlus, ChevronRight,
  Clock, GraduationCap, LayoutGrid, Plus, ReceiptText, Sparkles,
  Sun, TrendingUp, UserPlus, Users, Wallet, X,
} from 'lucide-react';
import { BookMark } from '../common/Logo.jsx';
import { cn } from '../../utils/cn.js';

export const DashboardMockup = ({ className }) => {
  return (
    <div className={cn('relative w-full select-none', className)}>
      {/* Decorative Sparkle Accent Burst on Top-Right */}
      <div className="pointer-events-none absolute -right-3 -top-5 z-20 text-indigo-600 sm:-right-6 sm:-top-6">
        <svg width="44" height="44" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="23" y1="4" x2="23" y2="14" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" />
          <line x1="36" y1="9" x2="29" y2="16" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" />
          <line x1="42" y1="23" x2="32" y2="23" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      {/* Floating Pill 1 (Top Left) — New Student Notification */}
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -left-3 -top-6 z-30 flex items-center gap-3 rounded-2xl border border-white/90 bg-white/90 px-3.5 py-2.5 shadow-xl shadow-indigo-500/10 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/90 sm:-left-6 sm:-top-8 sm:px-4 sm:py-3"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-500/30">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="text-xs font-bold text-slate-900 dark:text-white">New Student Registered</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Ahmed Khan · Seat 12</p>
        </div>
        <ArrowRight className="ml-1 h-3.5 w-3.5 text-slate-400" />
      </motion.div>

      {/* Floating Pill 2 (Bottom Right) — Seat Utilization */}
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -bottom-6 -right-3 z-30 flex items-center gap-3.5 rounded-2xl border border-white/90 bg-white/90 px-4 py-2.5 shadow-xl shadow-indigo-500/10 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/90 sm:-bottom-8 sm:-right-6 sm:py-3"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/70 dark:text-teal-400">
          <Armchair className="h-4.5 w-4.5" />
        </div>
        <div className="leading-tight">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Seat Occupancy
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-sm font-black text-slate-900 dark:text-white">1 / 20 Seats</span>
            <span className="flex items-center text-xs font-bold text-emerald-500">↑ 5%</span>
          </div>
        </div>
      </motion.div>

      {/* Device Frame */}
      <div className="relative z-10 mx-auto w-full">
        {/* Laptop Lid Screen Frame */}
        <div className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] border-[6px] sm:border-[8px] border-slate-900 bg-slate-900 shadow-2xl shadow-indigo-950/20">
          {/* Top Bezel Camera Dot */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-700 ring-1 ring-slate-800" />
          </div>

          {/* Screen Content Container with Aurora Mesh Backdrop */}
          <div className="relative overflow-hidden bg-slate-50 font-sans text-slate-800 dark:bg-slate-950 dark:text-slate-100" style={{
            backgroundImage: 'radial-gradient(at 0% 0%, rgba(219, 234, 254, 0.7) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(238, 242, 255, 0.7) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(240, 249, 255, 0.6) 0px, transparent 50%)',
          }}>
            {/* Top Navigation Bar */}
            <div className="flex h-12 items-center justify-between border-b border-white/70 bg-white/75 backdrop-blur-md px-3 sm:px-4 dark:border-white/10 dark:bg-slate-950/75">
              {/* Search Bar pill */}
              <div className="relative flex items-center w-48 sm:w-72">
                <input
                  type="text"
                  readOnly
                  value="Search students, seats, books..."
                  className="w-full h-8 pl-8 pr-8 rounded-xl border border-white/90 bg-white/80 text-[11px] font-medium text-slate-700 shadow-xs placeholder:text-slate-400 select-none cursor-default dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300"
                />
                <svg className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <span className="absolute right-2 text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded">
                  ⌘ K
                </span>
              </div>

              {/* Right Side Icons & Profile */}
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/80 text-slate-600 shadow-xs dark:bg-slate-800 dark:text-slate-300">
                  <Sun className="h-3.5 w-3.5" />
                </div>
                <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-white/80 text-slate-600 shadow-xs dark:bg-slate-800 dark:text-slate-300">
                  <Bell className="h-3.5 w-3.5" />
                  <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-rose-500" />
                </div>
                <div className="flex items-center gap-1.5 rounded-xl border border-white/80 bg-white/80 p-1 pr-2.5 shadow-xs dark:border-white/10 dark:bg-slate-900/80">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-500 text-[10px] font-bold text-white">
                    N
                  </div>
                  <div className="hidden sm:block leading-none text-left">
                    <span className="block text-[11px] font-bold text-slate-800 dark:text-slate-200">Nasir</span>
                    <span className="block text-[9px] text-slate-400">Librarian</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Content: Sidebar + Canvas */}
            <div className="flex min-h-[460px]">
              {/* Left Mini Sidebar */}
              <aside className="w-28 sm:w-44 shrink-0 border-r border-white/70 bg-white/75 backdrop-blur-xl p-2.5 flex flex-col justify-between dark:border-white/10 dark:bg-slate-950/80">
                <div className="space-y-3">
                  {/* Logo squircle */}
                  <div className="flex items-center gap-2 px-1">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-500 shadow-sm text-white">
                      <BookMark className="h-4.5 w-4.5 text-white" />
                    </div>
                    <div className="hidden sm:block leading-none">
                      <span className="block text-xs font-black tracking-tight text-slate-900 dark:text-white">LibraDesk</span>
                      <span className="block text-[8px] text-slate-400 mt-0.5">Management System</span>
                    </div>
                  </div>

                  {/* Nav Item: Active Dashboard */}
                  <div className="flex items-center gap-2 rounded-xl bg-indigo-50/90 text-indigo-600 px-2.5 py-1.5 text-[11px] font-bold shadow-xs dark:bg-indigo-950/80 dark:text-indigo-400">
                    <span className="h-2 w-2 rounded-full bg-indigo-600" />
                    <span className="truncate">Dashboard</span>
                  </div>

                  {/* Section Label: LIBRARY */}
                  <p className="hidden sm:block px-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    LIBRARY
                  </p>

                  {/* Other Nav Items */}
                  <div className="space-y-1">
                    {[
                      { label: 'Students', icon: Users },
                      { label: 'Seats', icon: LayoutGrid },
                      { label: 'Fees', icon: ReceiptText },
                      { label: 'Employees', icon: UserPlus },
                      { label: 'Finance', icon: Wallet },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="flex items-center justify-between rounded-xl px-2 py-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-800 transition-colors">
                          <span className="flex items-center gap-2 truncate">
                            <Icon className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{item.label}</span>
                          </span>
                          <ChevronRight className="hidden sm:block h-3 w-3 text-slate-400" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer User Pill */}
                <div className="flex items-center gap-2 rounded-xl border border-white/80 bg-white/80 p-1.5 shadow-xs dark:border-white/10 dark:bg-slate-900/80">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-[10px] font-bold text-white">
                    N
                  </div>
                  <div className="hidden sm:block min-w-0 leading-tight">
                    <span className="block text-[10px] font-bold text-slate-800 truncate dark:text-slate-200">Nasir</span>
                    <span className="block text-[8px] text-slate-400">Librarian</span>
                  </div>
                </div>
              </aside>

              {/* Main Canvas Area */}
              <div className="flex-1 min-w-0 p-3 sm:p-4 space-y-3">
                {/* 1. Panoramic Welcome Banner with Books Graphic */}
                <div className="relative overflow-hidden rounded-2xl border border-white/90 bg-gradient-to-r from-blue-100/75 via-indigo-50/70 to-purple-100/70 p-3.5 sm:p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:from-slate-900/90 dark:via-indigo-950/50 dark:to-slate-900/90">
                  {/* Right side artwork */}
                  <div className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-1/3 sm:block overflow-hidden">
                    <img
                      src="/banner-books.jpg"
                      alt="Books"
                      className="h-full w-full object-cover object-right opacity-80"
                      style={{
                        maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 80%)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 80%)',
                      }}
                    />
                  </div>

                  <div className="relative z-10 max-w-sm">
                    <span className="text-[10px] font-semibold text-slate-500">Good Morning, ⛅</span>
                    <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white mt-0.5">
                      Assalam-o-Alaikum, Nasir 👋
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
                      Here’s what’s happening with your library today.
                    </p>

                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/90 bg-white/80 px-2 py-0.5 text-[10px] font-bold shadow-xs dark:bg-slate-800">
                        <Calendar className="h-3 w-3 text-indigo-500" />
                        <span>Today Oct 12, 2026</span>
                      </div>
                      <span className="hidden sm:inline text-[9px] text-slate-500 italic">
                        “Books are a uniquely portable magic.”
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Quick Action Pills Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-xl border border-white/90 bg-white/80 px-2.5 py-1 text-[10px] font-bold text-slate-700 shadow-xs dark:border-white/10 dark:bg-slate-900/80">
                      <ReceiptText className="h-3 w-3 text-indigo-500" />
                      <span>Check overdue fees</span>
                      <ArrowRight className="h-2.5 w-2.5 text-slate-400" />
                    </div>
                    <div className="flex items-center gap-1.5 rounded-xl border border-white/90 bg-white/80 px-2.5 py-1 text-[10px] font-bold text-slate-700 shadow-xs dark:border-white/10 dark:bg-slate-900/80">
                      <CalendarPlus className="h-3 w-3 text-blue-500" />
                      <span>Generate invoices</span>
                      <ArrowRight className="h-2.5 w-2.5 text-slate-400" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 text-[10px] font-bold text-white shadow-sm">
                    <Plus className="h-3 w-3" />
                    <span>Add student</span>
                  </div>
                </div>

                {/* 3. 5 Stat Cards */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {[
                    { label: 'Students', val: '1', sub: '1 active · 0 pending', tone: 'bg-purple-50 text-purple-600', trend: '↑ 0%' },
                    { label: 'Seat Occupancy', val: '1 / 20', sub: '19 free · 5% used', tone: 'bg-emerald-50 text-emerald-600', trend: '↑ 5%' },
                    { label: 'Collected — Oct', val: 'Rs. 0', sub: 'Expected Rs. 1.1k', tone: 'bg-sky-50 text-sky-600', trend: '↑ 0%' },
                    { label: 'Fee Collection', val: '0%', sub: '1 unpaid · 0 partial', tone: 'bg-amber-50 text-amber-600', trend: '0%' },
                    { label: 'Income (Mo)', val: 'Rs. 0', sub: 'Expenses Rs. 0', tone: 'bg-teal-50 text-teal-600', trend: '↑ 0%' },
                  ].map((card) => (
                    <div key={card.label} className="rounded-2xl border border-white/80 bg-white/80 p-2 sm:p-2.5 shadow-xs dark:border-white/10 dark:bg-slate-900/80">
                      <div className="flex items-center justify-between">
                        <span className={cn('flex h-5 w-5 items-center justify-center rounded-lg text-[10px]', card.tone)}>
                          ●
                        </span>
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded-full dark:bg-emerald-950 dark:text-emerald-400">
                          {card.trend}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">{card.val}</span>
                      </div>
                      <p className="text-[9px] text-slate-400 truncate mt-0.5">{card.sub}</p>
                    </div>
                  ))}
                </div>

                {/* 4. Bottom Grid: Spline Chart & Activity & To-do List */}
                <div className="grid gap-2 sm:grid-cols-12">
                  {/* Income vs Expenses Chart (6 cols) */}
                  <div className="sm:col-span-6 rounded-2xl border border-white/80 bg-white/80 p-2.5 shadow-xs dark:border-white/10 dark:bg-slate-900/80 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <span className="text-[11px] font-bold text-slate-900 dark:text-white">Income vs Expenses</span>
                        <div className="flex items-center gap-2 text-[9px] text-slate-400 mt-0.5">
                          <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Income</span>
                          <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-purple-500" /> Expenses</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">6 Months ▾</span>
                    </div>

                    {/* Dual Curve SVG */}
                    <div className="relative h-20 w-full">
                      <svg viewBox="0 0 320 80" preserveAspectRatio="none" className="h-full w-full">
                        <defs>
                          <linearGradient id="incMock" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                          </linearGradient>
                          <linearGradient id="expMock" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d="M 0 50 C 50 20, 100 45, 160 30 C 220 15, 270 40, 320 20 L 320 75 L 0 75 Z" fill="url(#incMock)" />
                        <path d="M 0 50 C 50 20, 100 45, 160 30 C 220 15, 270 40, 320 20" stroke="#10B981" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                        <path d="M 0 65 C 60 45, 120 60, 180 50 C 240 40, 280 55, 320 45 L 320 75 L 0 75 Z" fill="url(#expMock)" />
                        <path d="M 0 65 C 60 45, 120 60, 180 50 C 240 40, 280 55, 320 45" stroke="#8B5CF6" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  {/* Recent Activity (3 cols) */}
                  <div className="sm:col-span-3 rounded-2xl border border-white/80 bg-white/80 p-2.5 shadow-xs dark:border-white/10 dark:bg-slate-900/80">
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white">Recent Activity</span>
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">New student</span>
                        <span className="text-[9px] text-slate-400">2h ago</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">Seat 12 booked</span>
                        <span className="text-[9px] text-slate-400">4h ago</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">Fee collected</span>
                        <span className="text-[9px] text-slate-400">5h ago</span>
                      </div>
                    </div>
                  </div>

                  {/* To-Do List & Keep Going (3 cols) */}
                  <div className="sm:col-span-3 rounded-2xl border border-white/80 bg-white/80 p-2.5 shadow-xs dark:border-white/10 dark:bg-slate-900/80 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-900 dark:text-white">Today’s to-do list</span>
                      <div className="mt-1.5 space-y-1">
                        <div className="rounded-lg bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                          🔴 1 unpaid invoice
                        </div>
                        <div className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                          🟢 19 seats free
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="font-serif italic text-xs font-bold text-indigo-600">Keep Going 💙</span>
                      <img src="/keep-going-books.jpg" alt="Books" className="h-6 w-6 rounded-md object-cover" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Laptop Deck Base */}
        <div className="relative mx-auto -mt-1 h-3.5 w-[96%] rounded-b-xl bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-md">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-16 rounded-b bg-slate-950" />
        </div>
        <div className="mx-auto h-3 w-[85%] rounded-full bg-slate-400/25 blur-md dark:bg-black/50" />
      </div>
    </div>
  );
};
