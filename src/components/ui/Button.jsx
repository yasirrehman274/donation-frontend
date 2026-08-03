import React from 'react';

const VARIANTS = {
  primary: 'bg-primary hover:bg-primary-dark text-white',
  secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
  danger: 'bg-danger hover:bg-red-700 text-white',
  success: 'bg-success hover:bg-teal-600 text-white',
  warning: 'bg-warning hover:bg-orange-500 text-white',
};

const SIZES = {
  md: 'px-5 py-2.5 text-sm',
  sm: 'px-3 py-1.5 text-xs',
  xs: 'px-2 py-1 text-xs',
};

export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-lg font-semibold transition-all hover:-translate-y-px ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
