export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const CATEGORIES = [
  'General', 'Education', 'Medical', 'Food',
  'Construction', 'Charity', 'Utilities', 'Other',
];

export const PAYMENT_METHODS = [
  'Bank Transfer', 'JazzCash', 'EasyPaisa', 'Cash',
];

export const DONATION_STATUSES = ['Pending', 'Approved', 'Rejected'];

export const PHONE_MAX_LENGTH = 11;
export const PHONE_REGEX = /^03[0-9]{9}$/;
export const PHONE_ERROR = 'Phone number must be exactly 11 digits.';

export const sanitizePhone = (value) =>
  String(value == null ? '' : value).replace(/\D/g, '').slice(0, PHONE_MAX_LENGTH);

export const isValidPhone = (value) => PHONE_REGEX.test(sanitizePhone(value));

export const getApiError = (error) => {
  if (error && error.response && error.response.data) {
    const { message } = error.response.data;
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.map((m) => (typeof m === 'object' ? m.msg : m)).join(', ');
    return 'Request failed';
  }
  return (error && error.message) || 'Something went wrong';
};

export const formatNumber = (num) => Number(num || 0).toLocaleString('en-PK');

export const formatPKR = (num) => 'PKR ' + formatNumber(num);

export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-PK', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export const getTodayDate = () => new Date().toISOString().split('T')[0];

export const generateId = () =>
  'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

export const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
};
