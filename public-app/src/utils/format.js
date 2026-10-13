const DEFAULT_CURRENCY = { code: 'PKR', symbol: 'Rs.' };

/** Formats money with the platform currency (never hardcodes a symbol in pages). */
export const formatMoney = (value, currency = DEFAULT_CURRENCY, { compact = false } = {}) => {
  const amount = Number(value || 0);
  const symbol = currency?.symbol || DEFAULT_CURRENCY.symbol;
  if (compact && Math.abs(amount) >= 1000) {
    const units = [
      { limit: 1e7, suffix: 'Cr' },
      { limit: 1e5, suffix: 'L' },
      { limit: 1e3, suffix: 'k' },
    ];
    const unit = units.find((u) => Math.abs(amount) >= u.limit);
    if (unit) return `${symbol} ${(amount / unit.limit).toFixed(amount % unit.limit === 0 ? 0 : 1)}${unit.suffix}`;
  }
  return `${symbol} ${amount.toLocaleString('en-PK')}`;
};

export const formatNumber = (value, opts = {}) => Number(value || 0).toLocaleString('en-PK', opts);

export const formatPercent = (value, digits = 1) =>
  `${Number(value || 0).toFixed(digits).replace(/\.0$/, '')}%`;

export const formatDate = (value, opts = { day: '2-digit', month: 'short', year: 'numeric' }) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', opts);
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return `${formatDate(d)} · ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
};

export const formatRelative = (value) => {
  if (!value) return '—';
  const then = new Date(value).getTime();
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (Math.abs(mins) < 1) return 'just now';
  if (Math.abs(mins) < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return `${days}d ago`;
  return formatDate(value);
};

export const periodToLabel = (periodKey, { short = false } = {}) => {
  if (!periodKey) return '—';
  const [y, m] = String(periodKey).split('-').map(Number);
  if (!y || !m) return String(periodKey);
  const name = new Date(y, m - 1, 1).toLocaleDateString('en-GB', { month: short ? 'short' : 'long' });
  return `${name} ${y}`;
};

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || '?';

export const titleCase = (value = '') =>
  String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

/** yyyy-MM for the current month, and helpers used by period selectors. */
export const currentPeriod = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const periodOptions = (count = 18) => {
  const out = [];
  const now = new Date();
  for (let i = 0; i < count; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
    });
  }
  return out;
};

export const daysLeftLabel = (days) => {
  if (days === null || days === undefined) return '—';
  if (days <= 0) return 'Expired';
  if (days === 1) return '1 day left';
  return `${days} days left`;
};

export const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
