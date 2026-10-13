export const ROLES = { ADMIN: 'admin', LIBRARIAN: 'librarian', STUDENT: 'student', EMPLOYEE: 'employee' };

export const LIBRARY_STATUS_META = {
  pending: { label: 'Pending approval', tone: 'warning' },
  rejected: { label: 'Rejected', tone: 'destructive' },
  trial: { label: 'Free trial', tone: 'info' },
  active: { label: 'Active', tone: 'success' },
  payment_due: { label: 'Payment due', tone: 'warning' },
  suspended: { label: 'Suspended', tone: 'destructive' },
  cancelled: { label: 'Cancelled', tone: 'muted' },
};

export const STUDENT_STATUS_META = {
  pending: { label: 'Pending', tone: 'warning' },
  active: { label: 'Active', tone: 'success' },
  approved: { label: 'Approved', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'destructive' },
  fee_due: { label: 'Fee due', tone: 'destructive' },
  suspended: { label: 'Suspended', tone: 'muted' },
  left: { label: 'Left', tone: 'muted' },
};

export const FEE_STATUS_META = {
  paid: { label: 'Paid', tone: 'success' },
  partial: { label: 'Partial', tone: 'warning' },
  unpaid: { label: 'Unpaid', tone: 'destructive' },
};

export const SEAT_STATUS_META = {
  available: { label: 'Available', tone: 'success' },
  occupied: { label: 'Occupied', tone: 'info' },
  reserved: { label: 'Reserved', tone: 'warning' },
  maintenance: { label: 'Maintenance', tone: 'muted' },
};

export const EMPLOYEE_STATUS_META = {
  active: { label: 'Active', tone: 'success' },
  on_leave: { label: 'On leave', tone: 'warning' },
  resigned: { label: 'Resigned', tone: 'muted' },
  terminated: { label: 'Terminated', tone: 'destructive' },
};

export const SALARY_STATUS_META = {
  paid: { label: 'Paid', tone: 'success' },
  partial: { label: 'Partial', tone: 'warning' },
  pending: { label: 'Pending', tone: 'destructive' },
};

export const ATTENDANCE_META = {
  present: { label: 'Present', tone: 'success' },
  absent: { label: 'Absent', tone: 'destructive' },
  leave: { label: 'Leave', tone: 'warning' },
  half_day: { label: 'Half day', tone: 'info' },
  holiday: { label: 'Holiday', tone: 'muted' },
};

export const SOFTWAR_STATUS_META = {
  pending: { label: 'Pending', tone: 'warning' },
  paid: { label: 'Paid', tone: 'success' },
  overdue: { label: 'Overdue', tone: 'destructive' },
  none: { label: 'Not billed', tone: 'muted' },
};

export const EXPENSE_CATEGORIES = [
  { value: 'rent', label: 'Rent' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'internet', label: 'Internet' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'books', label: 'Books' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'taxes', label: 'Taxes' },
  { value: 'other', label: 'Other (incl. salaries)' },
];

export const VERIFICATION_STATUS_META = {
  pending_payment: { label: 'Pending Payment', tone: 'muted', step: 1 },
  payment_submitted: { label: 'Payment Submitted', tone: 'info', step: 2 },
  under_review: { label: 'Under Review', tone: 'warning', step: 3 },
  approved: { label: 'Approved', tone: 'primary', step: 4 },
  active: { label: 'Active', tone: 'success', step: 5 },
};

export const PAYMENT_METHODS = [
  { value: 'sadapay', label: 'SadaPay' },
  { value: 'nayapay', label: 'NayaPay' },
  { value: 'easypaisa', label: 'Easypaisa' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'jazzcash', label: 'JazzCash' },
  { value: 'card', label: 'Card' },
  { value: 'other', label: 'Other' },
];

export const LIBRARY_TYPES = [
  { value: 'reading_room', label: 'Reading room / study hall' },
  { value: 'lending', label: 'Lending library' },
  { value: 'hybrid', label: 'Hybrid (reading + lending)' },
  { value: 'study_center', label: 'Study center / academy' },
];

export const PLATFORM_FEATURES = [
  { key: 'studentManagement', name: 'Student Management', description: 'Complete student records with photo, CNIC, guardian details, membership status and history.', icon: 'Users' },
  { key: 'seatManagement', name: 'Seat Management', description: 'A visual seat map that shows instantly which seats are free and who sits where.', icon: 'LayoutGrid' },
  { key: 'feeManagement', name: 'Fee Management', description: 'Monthly invoices, partial payments, paid/unpaid tracking and one-click reminders.', icon: 'ReceiptText' },
  { key: 'employeeManagement', name: 'Employee Management', description: 'Staff records, positions, joining dates and documents in one register.', icon: 'BriefcaseBusiness' },
  { key: 'salaryManagement', name: 'Salary & Payroll', description: 'Monthly payroll runs, partial salary payments and automatic expense booking.', icon: 'Wallet' },
  { key: 'expenseManagement', name: 'Expense Management', description: 'Track rent, electricity, internet, maintenance, books, furniture and everything else.', icon: 'TrendingDown' },
  { key: 'profitTracking', name: 'Profit Tracking', description: 'Income, expenses and net profit calculated automatically with monthly trends.', icon: 'LineChart' },
  { key: 'notifications', name: 'Notifications', description: 'Fee reminders, payment confirmations and announcements delivered in-app.', icon: 'BellRing' },
  { key: 'reports', name: 'Reports', description: 'Ten ready-made reports — students, fees, seats, payroll, expenses and profit.', icon: 'FileBarChart' },
  { key: 'libraryProfile', name: 'Library Profile', description: 'Your own branding: library name, logo, timings, facilities and public listing.', icon: 'Building2' },
  { key: 'adminCommunication', name: 'Direct Support Channel', description: 'Message platform administration directly and get replies inside your dashboard.', icon: 'MessagesSquare' },
  { key: 'studentPortal', name: 'Student Portal', description: 'Students sign in to see their seat, fee status, payment history and notifications.', icon: 'IdCard' },
];

export const PAIN_POINTS = [
  { problem: 'Student records in registers and notebooks', solution: 'A searchable digital register with photos, CNIC, phone and full history for every student.', icon: 'BookX' },
  { problem: 'No idea who has paid and who has not', solution: 'Monthly invoices with paid, partial and unpaid states — plus automatic overdue detection.', icon: 'ReceiptText' },
  { problem: 'Records lost, damaged or written twice', solution: 'Everything is stored securely in the cloud with a full audit trail of changes.', icon: 'ShieldCheck' },
  { problem: 'Seat clashes and empty seats going unnoticed', solution: 'A live seat map shows occupied and free seats at a glance, with one student per seat enforced.', icon: 'LayoutGrid' },
  { problem: 'Profit is guesswork at the end of the month', solution: 'Income, expenses and net profit are calculated automatically as you record entries.', icon: 'Calculator' },
  { problem: 'Salary and staff payments tracked on paper', solution: 'Run payroll in a click, record part-payments and every payment becomes an expense automatically.', icon: 'Wallet' },
  { problem: 'Students leave without any organised record', solution: 'A proper leaving flow captures the date, reason, refund and frees the seat instantly — history stays.', icon: 'LogOut' },
  { problem: 'No single dashboard to see the whole business', solution: 'One home screen with students, seats, fees, salaries and profit — updated live.', icon: 'Gauge' },
];
