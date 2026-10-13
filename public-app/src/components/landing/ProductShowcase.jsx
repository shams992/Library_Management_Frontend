import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Armchair,
  Receipt,
  UserRoundCog,
  TrendingUp,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  DollarSign,
  ReceiptText,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button.jsx';
import { Badge } from '../ui/badge.jsx';
import { cn } from '../../utils/cn.js';

const TABS = [
  {
    id: 'overview',
    label: 'Overview & KPIs',
    icon: TrendingUp,
    badge: 'Live',
    headline: 'Real-time library command center',
    description: 'Track daily attendance, occupied seats, pending collections, and net profit at a glance.',
  },
  {
    id: 'students',
    label: 'Students',
    icon: Users,
    badge: 'Profiles',
    headline: 'Unified student profiles & history',
    description: 'Instant search by name, CNIC, or seat number with complete fee payment and attendance logs.',
  },
  {
    id: 'seats',
    label: 'Visual Seat Map',
    icon: Armchair,
    badge: 'Zero Clashes',
    headline: 'Live seat grid & occupancy tracking',
    description: 'Zone-based seat layout ensures 1 student per seat with real-time occupied and free states.',
  },
  {
    id: 'fees',
    label: 'Fees & Invoicing',
    icon: Receipt,
    badge: 'Automated',
    headline: 'Monthly billing & automated reminders',
    description: 'Track paid, partial, and overdue fees with automated reminders and instant receipts.',
  },
  {
    id: 'employees',
    label: 'Staff & Payroll',
    icon: UserRoundCog,
    badge: 'Operations',
    headline: 'Staff attendance & salary register',
    description: 'Maintain employee roles, daily attendance, and automatically book salaries into monthly expenses.',
  },
  {
    id: 'profit',
    label: 'Net Profit & Finance',
    icon: DollarSign,
    badge: 'Formula',
    headline: 'Net Profit = Total Income – Total Expenses',
    description: 'Crystal-clear accounting: fee revenue minus operating overhead and salaries calculated automatically.',
  },
];

export const ProductShowcase = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <section id="how-it-works" className="relative border-y border-border bg-muted/20 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Complete Operating System
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything your library needs in one place
          </h2>
          <p className="lede mx-auto mt-3 max-w-2xl text-muted-foreground">
            Explore the core modules that power modern private libraries. Switch tabs below to preview the dashboard.
          </p>
        </div>

        {/* Tab Navigation Controls */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30 scale-105'
                    : 'border border-white/80 bg-white/70 text-slate-600 hover:bg-white hover:text-slate-900 shadow-xs backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-800'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'hidden rounded-full px-2 py-0.5 text-[0.65rem] font-bold md:inline-block',
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  )}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Description Banner */}
        <div className="mt-8 text-center">
          {TABS.filter((t) => t.id === activeTab).map((current) => (
            <div key={current.id} className="animate-in fade-in duration-300">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">{current.headline}</h3>
              <p className="mt-1.5 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto">{current.description}</p>
            </div>
          ))}
        </div>

        {/* Product Showcase Window Mockup */}
        <div className="mt-10 overflow-hidden rounded-3xl glass-card border border-white/80 bg-white/75 shadow-[0_25px_60px_-15px_rgba(79,70,229,0.12)] backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-900/80">
          {/* Window Chrome Header */}
          <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-destructive/70" />
              <span className="h-3 w-3 rounded-full bg-warning/70" />
              <span className="h-3 w-3 rounded-full bg-success/70" />
              <div className="ml-2 hidden items-center gap-2 rounded-md border border-border/80 bg-background px-3 py-1 text-xs text-muted-foreground sm:flex font-mono">
                libradesk.app/librarian/{activeTab}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-0.5 text-[0.7rem] font-semibold text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                Live Demo Preview
              </span>
            </div>
          </div>

          {/* Interactive Screen Preview */}
          <div className="p-4 sm:p-6 lg:p-8 min-h-[440px] flex flex-col justify-center bg-background/50">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* KPI Row */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Total Students</p>
                      <p className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">142</p>
                      <span className="mt-1 inline-block text-[0.7rem] font-medium text-success">+8 this month</span>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Available Seats</p>
                      <p className="mt-2 text-2xl font-bold text-success sm:text-3xl">36 <span className="text-sm font-normal text-muted-foreground">/ 120</span></p>
                      <span className="mt-1 inline-block text-[0.7rem] font-medium text-muted-foreground">70% Occupancy</span>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Unpaid Fees</p>
                      <p className="mt-2 text-2xl font-bold text-destructive sm:text-3xl">18</p>
                      <span className="mt-1 inline-block text-[0.7rem] font-medium text-destructive">Rs 36,000 pending</span>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Net Profit (Mo)</p>
                      <p className="mt-2 text-2xl font-bold text-primary sm:text-3xl">Rs 84,000</p>
                      <span className="mt-1 inline-block text-[0.7rem] font-medium text-success">+14% vs last month</span>
                    </div>
                  </div>

                  {/* Financial & Activity Split */}
                  <div className="grid gap-6 lg:grid-cols-12">
                    <div className="lg:col-span-7 rounded-xl border border-border bg-card p-5">
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Income vs Expenses (Monthly Trend)</p>
                          <p className="text-xs text-muted-foreground">Automated profit computation</p>
                        </div>
                        <Badge tone="success">+12.4% Margin</Badge>
                      </div>
                      <div className="mt-4 flex h-36 items-end justify-between gap-3 pt-4">
                        {[
                          { m: 'May', inc: 70, exp: 35, profit: 'Rs 52k' },
                          { m: 'Jun', inc: 75, exp: 38, profit: 'Rs 58k' },
                          { m: 'Jul', inc: 82, exp: 40, profit: 'Rs 65k' },
                          { m: 'Aug', inc: 88, exp: 42, profit: 'Rs 74k' },
                          { m: 'Sep', inc: 92, exp: 45, profit: 'Rs 80k' },
                          { m: 'Oct', inc: 100, exp: 46, profit: 'Rs 84k' },
                        ].map((col) => (
                          <div key={col.m} className="flex flex-1 flex-col items-center gap-1.5">
                            <div className="flex w-full items-end justify-center gap-1" style={{ height: '100px' }}>
                              <span className="w-1/2 rounded-t-sm bg-success/80" style={{ height: `${col.inc}%` }} title={`Income: ${col.m}`} />
                              <span className="w-1/2 rounded-t-sm bg-destructive/60" style={{ height: `${col.exp}%` }} title={`Expenses: ${col.m}`} />
                            </div>
                            <span className="text-[0.65rem] font-medium text-muted-foreground">{col.m}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center justify-center gap-6 text-xs text-muted-foreground border-t border-border/70 pt-2">
                        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-success/80" /> Total Income</span>
                        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-destructive/60" /> Total Expenses</span>
                      </div>
                    </div>

                    <div className="lg:col-span-5 rounded-xl border border-border bg-card p-5 space-y-3">
                      <p className="text-sm font-semibold text-foreground">Recent Fee Collections</p>
                      <div className="space-y-2.5">
                        {[
                          { name: 'Hamza Tariq', seat: 'Seat 14', amount: 'Rs 2,500', status: 'Paid', tone: 'text-success' },
                          { name: 'Ayesha Malik', seat: 'Seat 29', amount: 'Rs 2,500', status: 'Paid', tone: 'text-success' },
                          { name: 'Zeeshan Ali', seat: 'Seat 06', amount: 'Rs 2,500', status: 'Unpaid', tone: 'text-destructive' },
                          { name: 'Fatima Noor', seat: 'Seat 33', amount: 'Rs 1,500 (Part)', status: 'Partial', tone: 'text-warning' },
                        ].map((item) => (
                          <div key={item.name} className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/20 p-2.5 text-xs">
                            <div>
                              <p className="font-semibold text-foreground">{item.name}</p>
                              <p className="text-[0.68rem] text-muted-foreground">{item.seat}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-foreground">{item.amount}</p>
                              <span className={cn('text-[0.68rem] font-bold', item.tone)}>{item.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'students' && (
                <motion.div
                  key="students"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Search className="h-4 w-4" />
                      <span>Search 142 students by name, CNIC, phone, or code...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">Filter: All Active</span>
                      <span className="rounded-md bg-primary/10 text-primary px-2 py-1 text-xs font-semibold">+ Add Student</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-border bg-card">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-border bg-muted/40 text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Student Code</th>
                          <th className="px-4 py-3 font-semibold">Full Name</th>
                          <th className="px-4 py-3 font-semibold">Seat Assigned</th>
                          <th className="px-4 py-3 font-semibold">Contact / Phone</th>
                          <th className="px-4 py-3 font-semibold">Monthly Fee</th>
                          <th className="px-4 py-3 font-semibold">Fee Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/70">
                        {[
                          { code: 'LMS-00104', name: 'Bilal Ahmad', seat: 'Seat 05 (Hall A)', phone: '0301 4567890', fee: 'Rs 2,500', status: 'Paid', tone: 'bg-success/15 text-success' },
                          { code: 'LMS-00105', name: 'Zainab Bibi', seat: 'Seat 18 (Hall B)', phone: '0321 9876543', fee: 'Rs 2,500', status: 'Paid', tone: 'bg-success/15 text-success' },
                          { code: 'LMS-00106', name: 'Usman Farooq', seat: 'Seat 22 (Hall A)', phone: '0333 1122334', fee: 'Rs 2,500', status: 'Unpaid', tone: 'bg-destructive/15 text-destructive' },
                          { code: 'LMS-00107', name: 'Khadija Rizvi', seat: 'Seat 34 (Hall B)', phone: '0345 5566778', fee: 'Rs 2,500', status: 'Paid', tone: 'bg-success/15 text-success' },
                          { code: 'LMS-00108', name: 'Tariq Mehmood', seat: 'Seat 41 (Hall A)', phone: '0300 4455667', fee: 'Rs 2,500', status: 'Partial', tone: 'bg-warning/15 text-warning' },
                        ].map((row) => (
                          <tr key={row.code} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-mono font-medium">{row.code}</td>
                            <td className="px-4 py-3 font-semibold text-foreground">{row.name}</td>
                            <td className="px-4 py-3 text-muted-foreground">{row.seat}</td>
                            <td className="px-4 py-3 text-muted-foreground">{row.phone}</td>
                            <td className="px-4 py-3 font-medium">{row.fee}</td>
                            <td className="px-4 py-3">
                              <span className={cn('rounded-full px-2 py-0.5 text-[0.65rem] font-bold', row.tone)}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'seats' && (
                <motion.div
                  key="seats"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Hall A — Quiet Study Zone (Floor 1)</p>
                      <p className="text-xs text-muted-foreground">30 of 40 seats currently occupied (75%)</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-[0.55rem]">✓</span> Occupied (30)</span>
                      <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-md border border-dashed border-success bg-success/15" /> Available (10)</span>
                    </div>
                  </div>

                  {/* Seat Grid */}
                  <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2.5 p-2">
                    {Array.from({ length: 30 }).map((_, i) => {
                      const seatNum = String(i + 1).padStart(2, '0');
                      const isOccupied = i % 4 !== 0;
                      return (
                        <div
                          key={i}
                          className={cn(
                            'flex flex-col items-center justify-center h-12 rounded-lg border text-center transition-all cursor-pointer',
                            isOccupied
                              ? 'border-primary/30 bg-primary/10 text-primary font-semibold hover:bg-primary/20'
                              : 'border-dashed border-success/50 bg-success/10 text-success hover:bg-success/20'
                          )}
                          title={isOccupied ? `Seat ${seatNum} - Occupied` : `Seat ${seatNum} - Available`}
                        >
                          <span className="text-xs font-bold">{seatNum}</span>
                          <span className="text-[0.6rem] text-muted-foreground">
                            {isOccupied ? 'Taken' : 'Free'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-xl border border-border bg-muted/20 p-3 text-xs text-muted-foreground flex items-center justify-between">
                    <span>Double-booking prevention is enforced at the database level. Each seat holds at most 1 student.</span>
                    <Badge tone="success">Clash Prevention Active</Badge>
                  </div>
                </motion.div>
              )}

              {activeTab === 'fees' && (
                <motion.div
                  key="fees"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Invoiced</p>
                      <p className="mt-1 text-2xl font-bold text-foreground">Rs 154,000</p>
                      <p className="text-[0.7rem] text-muted-foreground">October 2026 Cycle</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Collected</p>
                      <p className="mt-1 text-2xl font-bold text-success">Rs 118,000</p>
                      <p className="text-[0.7rem] text-success font-semibold">76.6% Collection Rate</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Overdue Dues</p>
                      <p className="mt-1 text-2xl font-bold text-destructive">Rs 36,000</p>
                      <p className="text-[0.7rem] text-destructive">14 Overdue Invoices</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">Automated Notification Queue</p>
                      <span className="text-xs text-primary font-medium">Send Reminders (1-Click)</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      {[
                        { student: 'Farhan Zaidi', due: 'Rs 2,500', days: 'Overdue by 5 days', phone: '0300 5544332' },
                        { student: 'Nadia Qureshi', due: 'Rs 2,500', days: 'Overdue by 3 days', phone: '0312 9988776' },
                        { student: 'Arsalan Baig', due: 'Rs 1,000 (Remaining)', days: 'Due in 2 days', phone: '0345 1122445' },
                      ].map((item) => (
                        <div key={item.student} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2.5">
                          <div>
                            <span className="font-semibold text-foreground">{item.student}</span>
                            <span className="ml-2 text-muted-foreground">({item.phone})</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-foreground">{item.due}</span>
                            <span className="text-[0.7rem] text-destructive font-medium">{item.days}</span>
                            <button type="button" className="rounded bg-primary/10 px-2 py-0.5 text-[0.7rem] font-semibold text-primary">
                              SMS Alert
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'employees' && (
                <motion.div
                  key="employees"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Staff Register & Monthly Payroll</p>
                      <p className="text-xs text-muted-foreground">3 Staff Members · All attendance recorded today</p>
                    </div>
                    <span className="rounded-md bg-success/10 text-success px-2.5 py-1 text-xs font-semibold">
                      Payroll Status: Approved
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { name: 'Muhammad Usman', role: 'Head Librarian', salary: 'Rs 30,000', attendance: 'Present', tone: 'text-success' },
                      { name: 'Shahid Iqbal', role: 'Front Desk Assistant', salary: 'Rs 20,000', attendance: 'Present', tone: 'text-success' },
                      { name: 'Abdul Rehman', role: 'Security & Night Guard', salary: 'Rs 18,000', attendance: 'Present', tone: 'text-success' },
                    ].map((emp) => (
                      <div key={emp.name} className="rounded-xl border border-border bg-card p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <UserRoundCog className="h-4 w-4" />
                          </span>
                          <span className="rounded-full bg-success/15 px-2 py-0.5 text-[0.65rem] font-bold text-success">
                            {emp.attendance}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">{emp.role}</p>
                        <div className="border-t border-border/70 pt-2 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Monthly Salary</span>
                          <span className="font-bold text-foreground">{emp.salary}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
                    <strong className="text-foreground">Automated Expense Integration:</strong> When monthly salaries are paid,
                    they are booked directly into the financial ledger as payroll expenses, ensuring profit calculations remain 100% accurate.
                  </div>
                </motion.div>
              )}

              {activeTab === 'profit' && (
                <motion.div
                  key="profit"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Highlight Formula Card */}
                  <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 text-center">
                    <p className="text-xs uppercase tracking-widest text-primary font-bold">Standard Finance Formula</p>
                    <h4 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl font-mono">
                      Net Profit = Total Income − Total Expenses
                    </h4>
                    <p className="mt-2 text-xs text-muted-foreground max-w-lg mx-auto">
                      No guessing, no manual spreadsheets. Every student fee payment adds to income, and every utility bill
                      or staff salary subtracts from expenses in real time.
                    </p>
                  </div>

                  {/* Profit Breakdown Equation */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-success/30 bg-success/5 p-4 space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-success">1. Total Income</p>
                      <p className="text-2xl font-bold text-success">Rs 154,000</p>
                      <p className="text-xs text-muted-foreground">From student monthly fees & registrations</p>
                    </div>

                    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-destructive">2. Total Expenses</p>
                      <p className="text-2xl font-bold text-destructive">Rs 70,000</p>
                      <p className="text-xs text-muted-foreground">Salaries (Rs 45k) + Rent & Utilities (Rs 25k)</p>
                    </div>

                    <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">3. Net Profit</p>
                      <p className="text-2xl font-bold text-primary">Rs 84,000</p>
                      <p className="text-xs text-muted-foreground">54.5% Net Profit Margin</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom CTA for the section */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-center">
          <Button asChild size="lg">
            <Link to="/register">
              Start Your 2-Month Free Trial <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/libraries">Browse Public Library Directory</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
