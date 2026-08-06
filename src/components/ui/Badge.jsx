import React from 'react';

const STATUS_STYLES = {
  active: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  inactive: 'bg-gray-100 text-gray-600',
  default: 'bg-primary text-white',
};

export default function Badge({ children, status = 'default' }) {
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[status] || STATUS_STYLES.default}`}>
      {children}
    </span>
  );
}
