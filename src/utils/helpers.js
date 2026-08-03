export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const CATEGORIES = [
  'General', 'Education', 'Medical', 'Food',
  'Construction', 'Charity', 'Utilities', 'Other',
];

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
