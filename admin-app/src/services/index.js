import { del, downloadFile, get, patch, post, put, upload } from './api.js';

/** Platform Admin Service Layer */
export const authService = {
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
  admin: () => get('/settings/admin'),
  update: (payload) => put('/settings/admin', payload),
  billingSweep: (payload = {}) => post('/settings/admin/billing-sweep', payload),
};

export const libraryService = {
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
  thread: (conversationId, params) => get(`/messages/${conversationId}`, { params }),
  send: (payload) => post('/messages', payload),
};

export const contactService = {
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
