import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL,
  timeout: 25000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

const TOKEN_KEY = 'libradesk.token';

export const tokenStore = {
  get: () => {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set: (token) => {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch { /* storage unavailable — session stays in memory only */ }
  },
};

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Normalises API errors into { message, status, errors, isAuthError }. */
const normaliseError = (error) => {
  if (error.code === 'ECONNABORTED') {
    return { message: 'The request timed out. Please check your connection and try again.', status: 0 };
  }
  if (!error.response) {
    return { message: 'Cannot reach the server right now. Please try again in a moment.', status: 0 };
  }
  const { status, data } = error.response;
  const fieldErrors = Array.isArray(data?.errors) ? data.errors : [];
  const message =
    data?.message ||
    (status === 402
      ? 'Your library subscription is inactive. Your data is safe — please contact platform support.'
      : status >= 500
        ? 'Something went wrong on our side. Please try again.'
        : 'Request failed');
  return { message, status, errors: fieldErrors, isAuthError: status === 401, isSubscriptionError: status === 402 };
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // A 401 on a tenant endpoint means the session is no longer valid.
    if (error?.response?.status === 401 && !error.config?.url?.includes('/auth/')) {
      tokenStore.set(null);
      window.dispatchEvent(new CustomEvent('libradesk:unauthorized'));
    }
    return Promise.reject(normaliseError(error));
  }
);

export const get = (url, config) => api.get(url, config).then((r) => r.data);
export const post = (url, body, config) => api.post(url, body, config).then((r) => r.data);
export const put = (url, body, config) => api.put(url, body, config).then((r) => r.data);
export const patch = (url, body, config) => api.patch(url, body, config).then((r) => r.data);
export const del = (url, config) => api.delete(url, config).then((r) => r.data);

export const upload = (url, file, field = 'file', extra = {}) => {
  const form = new FormData();
  form.append(field, file);
  Object.entries(extra).forEach(([k, v]) => form.append(k, v));
  return api
    .post(url, form, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data);
};

/** Triggers a CSV/file download from an authenticated endpoint. */
export const downloadFile = async (url, filename) => {
  const response = await api.get(url, { responseType: 'blob' });
  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename || 'download.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

export const resolveMediaUrl = (url) => {
  if (!url) return null;
  if (/^(https?:|data:|blob:)/.test(url)) return url;
  return url; // relative paths are proxied to the API by the dev server
};
