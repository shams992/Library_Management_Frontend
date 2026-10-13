/**
 * Sidebar navigation definitions.
 * `children` render as collapsible groups; every route here exists in App.jsx —
 * there are no dead links in the UI.
 */
export const LIBRARIAN_NAV = [
  { label: 'Dashboard', to: '/librarian', icon: 'LayoutDashboard', end: true },
  {
    label: 'Students',
    icon: 'Users',
    children: [
      { label: 'All Students', to: '/librarian/students' },
      { label: 'Active', to: '/librarian/students?status=active' },
      { label: 'Pending', to: '/librarian/students?status=pending' },
      { label: 'Left', to: '/librarian/students?status=left' },
      { label: 'Fee Due', to: '/librarian/students?status=fee_due' },
    ],
  },
  {
    label: 'Seats',
    icon: 'LayoutGrid',
    children: [
      { label: 'Seat Map', to: '/librarian/seats' },
      { label: 'Available', to: '/librarian/seats?status=available' },
      { label: 'Occupied', to: '/librarian/seats?status=occupied' },
    ],
  },
  {
    label: 'Fees',
    icon: 'ReceiptText',
    children: [
      { label: 'Overview', to: '/librarian/fees' },
      { label: 'Paid', to: '/librarian/fees?status=paid' },
      { label: 'Unpaid', to: '/librarian/fees?status=unpaid' },
      { label: 'Payment History', to: '/librarian/fees/history' },
    ],
  },
  {
    label: 'Employees',
    icon: 'BriefcaseBusiness',
    children: [
      { label: 'Employees', to: '/librarian/employees' },
      { label: 'Attendance', to: '/librarian/employees/attendance' },
      { label: 'Salaries', to: '/librarian/employees/salaries' },
    ],
  },
  {
    label: 'Finance',
    icon: 'Wallet',
    children: [
      { label: 'Income', to: '/librarian/finance/income' },
      { label: 'Expenses', to: '/librarian/finance/expenses' },
      { label: 'Profit', to: '/librarian/finance/profit' },
      { label: 'Reports', to: '/librarian/finance/reports' },
    ],
  },
  { label: 'Notifications', to: '/librarian/notifications', icon: 'Bell' },
  { label: 'Messages', to: '/librarian/messages', icon: 'MessagesSquare' },
  { label: 'Library Settings', to: '/librarian/settings', icon: 'Settings' },
  { label: 'Subscription', to: '/librarian/subscription', icon: 'CreditCard' },
];

export const ADMIN_NAV = [
  { label: 'Dashboard', to: '/admin', icon: 'LayoutDashboard', end: true },
  {
    label: 'Libraries',
    icon: 'Building2',
    children: [
      { label: 'All Libraries', to: '/admin/libraries' },
      { label: 'Pending Approval', to: '/admin/libraries?status=pending' },
      { label: 'Trials', to: '/admin/libraries?status=trial' },
      { label: 'Active', to: '/admin/libraries?status=active' },
      { label: 'Suspended', to: '/admin/libraries?status=suspended' },
    ],
  },
  { label: 'Students', to: '/admin/students', icon: 'Users' },
  {
    label: 'Subscriptions',
    icon: 'CreditCard',
    children: [
      { label: 'Subscriptions', to: '/admin/subscriptions' },
      { label: 'Billing Controls', to: '/admin/subscriptions/controls' },
    ],
  },
  { label: 'Payments & Revenue', to: '/admin/payments', icon: 'Banknote' },
  { label: 'Messages', to: '/admin/messages', icon: 'MessagesSquare' },
  { label: 'Reports', to: '/admin/reports', icon: 'FileBarChart' },
  { label: 'Settings', to: '/admin/settings', icon: 'Settings' },
];

export const STUDENT_NAV = [
  { label: 'Overview', to: '/student', icon: 'LayoutDashboard', end: true },
  { label: 'My Fees', to: '/student/fees', icon: 'ReceiptText' },
  { label: 'My Seat', to: '/student/seat', icon: 'LayoutGrid' },
  { label: 'Notifications', to: '/student/notifications', icon: 'Bell' },
  { label: 'Profile', to: '/student/profile', icon: 'UserRound' },
];

export const EMPLOYEE_NAV = [
  { label: 'Overview', to: '/employee', icon: 'LayoutDashboard', end: true },
  { label: 'Salary', to: '/employee/salary', icon: 'Wallet' },
  { label: 'Attendance', to: '/employee/attendance', icon: 'CalendarCheck' },
  { label: 'Notifications', to: '/employee/notifications', icon: 'Bell' },
];

export const PORTAL_NAV = {
  librarian: LIBRARIAN_NAV,
  admin: ADMIN_NAV,
  student: STUDENT_NAV,
  employee: EMPLOYEE_NAV,
};

export const PORTAL_ROOT = {
  librarian: '/librarian',
  admin: '/admin',
  student: '/student',
  employee: '/employee',
};
