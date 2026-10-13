import { del, downloadFile, get, patch, post, put, upload } from './api.js';

/** Thin, typed-ish service layer — one function per API endpoint. */
export const authService = {
  registerLibrary: (payload) => post('/auth/register', payload),
  login: (payload) => post('/auth/login', payload),
  adminLogin: (payload) => post('/auth/admin/login', payload),
  me: () => get('/auth/me'),
  logout: () => post('/auth/logout', {}),
  forgotPassword: (email) => post('/auth/forgot-password', { email }),
  resetPassword: (payload) => post('/auth/reset-password', payload),
  changePassword: (payload) => post('/auth/change-password', payload),
  updateProfile: (payload) => patch('/auth/profile', payload),
  uploadAvatar: (file) => upload('/auth/avatar', file),
};

export const settingsService = {
  public: () => get('/settings/public'),
  publicStats: () => get('/settings/public-stats'),
  admin: () => get('/settings/admin'),
  update: (payload) => put('/settings/admin', payload),
  billingSweep: (payload = {}) => post('/settings/admin/billing-sweep', payload),
};

export const libraryService = {
  // public
  list: (params) => get('/libraries', { params }),
  detail: (id) => get(`/libraries/${id}`),
  apply: (id, payload) => post(`/students/apply/${id}`, payload),
  // librarian
  mine: () => get('/libraries/me'),
  updateMine: (payload) => put('/libraries/me', payload),
  uploadLogo: (file) => upload('/libraries/me/logo', file),
  mySubscription: () => get('/libraries/me/subscription'),
  submitPayment: (payload) => post('/libraries/me/subscription/submit-payment', payload),
  // admin
  adminList: (params) => get('/libraries/admin/all', { params }),
  adminDetail: (id) => get(`/libraries/admin/${id}`),
  adminUpdate: (id, payload) => patch(`/libraries/admin/${id}`, payload),
  adminUpdateVerificationStatus: (id, payload) => patch(`/libraries/admin/${id}/verification-status`, payload),
  approve: (id, payload) => post(`/libraries/admin/${id}/approve`, payload),
  reject: (id, payload) => post(`/libraries/admin/${id}/reject`, payload),
  activate: (id, payload = {}) => post(`/libraries/admin/${id}/activate`, payload),
  suspend: (id, payload) => post(`/libraries/admin/${id}/suspend`, payload),
  markPaymentDue: (id, payload = {}) => post(`/libraries/admin/${id}/mark-payment-due`, payload),
  extend: (id, payload) => post(`/libraries/admin/${id}/extend`, payload),
  recordPayment: (id, payload) => post(`/libraries/admin/${id}/payments`, payload),
  recalculate: (id) => post(`/libraries/admin/${id}/recalculate`, {}),
  remove: (id, confirm) => del(`/libraries/admin/${id}`, { params: { confirm } }),
};

export const dashboardService = {
  librarian: (params) => get('/dashboard/librarian', { params }),
  tasks: () => get('/dashboard/librarian/tasks'),
  refreshOverdue: () => post('/dashboard/refresh-overdue', {}),
};

export const studentService = {
  list: (params) => get('/students', { params }),
  detail: (id) => get(`/students/${id}`),
  create: (payload) => post('/students', payload),
  update: (id, payload) => put(`/students/${id}`, payload),
  assignSeat: (id, seatId) => patch(`/students/${id}/seat`, { seatId }),
  leave: (id, payload) => post(`/students/${id}/leave`, payload),
  reactivate: (id) => post(`/students/${id}/reactivate`, {}),
  approveApplication: (id, payload) => post(`/students/${id}/approve-application`, payload),
  feeHistory: (id, params) => get(`/students/${id}/fees`, { params }),
  uploadPhoto: (id, file) => upload(`/students/${id}/photo`, file),
  duplicates: () => get('/students/duplicates'),
};

export const seatService = {
  list: (params) => get('/seats', { params }),
  map: () => get('/seats/map'),
  create: (payload) => post('/seats', payload),
  update: (id, payload) => patch(`/seats/${id}`, payload),
  remove: (id) => del(`/seats/${id}`),
  reconcile: () => post('/seats/reconcile', {}),
};

export const feeService = {
  list: (params) => get('/fees', { params }),
  summary: (params) => get('/fees/summary', { params }),
  overview: (params) => get('/fees/overview', { params }),
  create: (payload) => post('/fees', payload),
  update: (id, payload) => put(`/fees/${id}`, payload),
  pay: (id, payload) => post(`/fees/${id}/pay`, payload),
  remove: (id) => del(`/fees/${id}`),
  generate: (payload) => post('/fees/generate', payload),
  syncOverdue: () => post('/fees/sync-overdue', { notify: true }),
  reminders: (payload) => post('/fees/reminders', payload),
  exportCsv: () => downloadFile('/fees/export', 'fee-report.csv'),
};

export const employeeService = {
  list: (params) => get('/employees', { params }),
  detail: (id) => get(`/employees/${id}`),
  create: (payload) => post('/employees', payload),
  update: (id, payload) => put(`/employees/${id}`, payload),
  archive: (id, payload) => post(`/employees/${id}/archive`, payload),
  uploadPhoto: (id, file) => upload(`/employees/${id}/photo`, file),
  salaries: (params) => get('/employees/salaries', { params }),
  generateSalaries: (payload) => post('/employees/salaries/generate', payload),
  paySalary: (id, payload) => post(`/employees/salaries/${id}/pay`, payload),
  updateSalary: (id, payload) => patch(`/employees/salaries/${id}`, payload),
  attendance: (params) => get('/employees/attendance', { params }),
  markAttendance: (payload) => post('/employees/attendance', payload),
};

export const expenseService = {
  list: (params) => get('/expenses', { params }),
  summary: (params) => get('/expenses/summary', { params }),
  create: (payload) => post('/expenses', payload),
  update: (id, payload) => put(`/expenses/${id}`, payload),
  remove: (id) => del(`/expenses/${id}`),
  uploadReceipt: (id, file) => upload(`/expenses/${id}/receipt`, file),
  exportCsv: (params) => downloadFile(`/expenses/export${toQuery(params)}`, 'expenses.csv'),
};

export const financeService = {
  overview: (params) => get('/finance/overview', { params }),
  catalog: () => get('/finance/reports'),
  report: (type, params) => get(`/finance/reports/${type}`, { params }),
  exportReport: (type, params) => downloadFile(`/finance/export/${type}${toQuery(params)}`, `${type}-report.csv`),
  syncOverdue: () => post('/finance/sync-overdue', { notify: true }),
};

export const notificationService = {
  list: (params) => get('/notifications', { params }),
  unreadCount: () => get('/notifications/unread-count'),
  markRead: (id) => patch(`/notifications/${id}/read`),
  markAllRead: () => patch('/notifications/read-all'),
  remove: (id) => del(`/notifications/${id}`),
  broadcast: (payload) => post('/notifications/broadcast', payload),
};

export const messageService = {
  conversations: (params) => get('/messages/conversations', { params }),
  unread: () => get('/messages/unread'),
  mine: () => get('/messages/mine'),
  thread: (conversationId, params) => get(`/messages/${conversationId}`, { params }),
  send: (payload) => post('/messages', payload),
};

export const contactService = {
  submit: (payload) => post('/contact', payload),
  list: (params) => get('/contact', { params }),
  update: (id, payload) => patch(`/contact/${id}`, payload),
};

export const adminService = {
  dashboard: () => get('/admin/dashboard'),
  revenue: (params) => get('/admin/revenue', { params }),
  auditLogs: (params) => get('/admin/audit-logs', { params }),
  students: (params) => get('/admin/students', { params }),
  billingSweep: (payload = {}) => post('/admin/billing-sweep', payload),
  users: (params) => get('/admin/users', { params }),
  setUserStatus: (id, status) => patch(`/admin/users/${id}/status`, { status }),
  exportRevenue: () => downloadFile('/admin/revenue/export', 'platform-revenue.csv'),
};

export const portalService = {
  context: () => get('/portal/context'),
  studentOverview: () => get('/portal/student/overview'),
  studentFees: (params) => get('/portal/student/fees', { params }),
  studentSeat: () => get('/portal/student/seat'),
  studentProfile: () => get('/portal/student/profile'),
  studentSummary: () => get('/portal/student/summary'),
  updateStudentProfile: (payload) => patch('/portal/student/profile', payload),
  employeeOverview: () => get('/portal/employee/overview'),
  employeeSalaries: () => get('/portal/employee/salaries'),
  employeeAttendance: (params) => get('/portal/employee/attendance', { params }),
};

function toQuery(params) {
  if (!params) return '';
  const search = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString();
  return search ? `?${search}` : '';
}
