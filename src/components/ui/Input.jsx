import React from 'react';

export default function Input({ label, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-dark">{label}</label>}
      <input
        className={`px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 ${className}`}
        {...props}
      />
    </div>
  );
}

export function Textarea({ label, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-dark">{label}</label>}
      <textarea
        className={`px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-sm transition-all resize-y focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 ${className}`}
        {...props}
      />
    </div>
  );
}
