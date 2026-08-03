import React from 'react';

export function Card({ children, className = '' }) {
  return <div className={`bg-white rounded-xl shadow-card overflow-hidden ${className}`}>{children}</div>;
}

export function CardHeader({ icon, title, action }) {
  return (
    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-dark flex items-center gap-2">
        {icon && <i className={`fas ${icon} text-primary`}></i>}
        {title}
      </h3>
      {action}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
