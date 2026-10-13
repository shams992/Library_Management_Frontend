/**
 * Admin Sidebar Navigation Definitions.
 * Root routes for admin.mydomain.com
 */
export const ADMIN_NAV = [
  { label: 'Dashboard', to: '/', icon: 'LayoutDashboard', end: true },
  {
    label: 'Libraries',
    icon: 'Building2',
    children: [
      { label: 'All Libraries', to: '/libraries' },
      { label: 'Pending Approval', to: '/libraries?status=pending' },
      { label: 'Trials', to: '/libraries?status=trial' },
      { label: 'Active', to: '/libraries?status=active' },
      { label: 'Suspended', to: '/libraries?status=suspended' },
    ],
  },
  { label: 'Students', to: '/students', icon: 'Users' },
  {
    label: 'Subscriptions',
    icon: 'CreditCard',
    children: [
      { label: 'Subscriptions', to: '/subscriptions' },
      { label: 'Billing Controls', to: '/subscriptions/controls' },
    ],
  },
  { label: 'Payments & Revenue', to: '/payments', icon: 'Banknote' },
  { label: 'Messages', to: '/messages', icon: 'MessagesSquare' },
  { label: 'Reports', to: '/reports', icon: 'FileBarChart' },
  { label: 'Settings', to: '/settings', icon: 'Settings' },
];

export const PORTAL_NAV = {
  admin: ADMIN_NAV,
};

export const PORTAL_ROOT = {
  admin: '/',
};
