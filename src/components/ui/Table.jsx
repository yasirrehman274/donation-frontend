import React from 'react';

export function Table({ children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

export function Thead({ columns }) {
  return (
    <thead>
      <tr>
        {columns.map((col, i) => (
          <th
            key={i}
            className="bg-dark text-white px-3.5 py-3 text-left font-semibold text-xs uppercase tracking-wide whitespace-nowrap"
          >
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function Td({ children, className = '', ...props }) {
  return (
    <td className={`px-3.5 py-2.5 border-b border-gray-100 align-middle ${className}`} {...props}>
      {children}
    </td>
  );
}

export function Tr({ children, className = '' }) {
  return <tr className={`hover:bg-blue-50/50 ${className}`}>{children}</tr>;
}

export function EmptyRow({ colSpan, message = 'No data found' }) {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center text-gray-500 py-6">{message}</td>
    </tr>
  );
}
