import React from 'react';

const COLORS = {
  blue: 'from-blue-500 to-blue-400',
  red: 'from-red-500 to-red-400',
  orange: 'from-orange-400 to-red-400',
  green: 'from-teal-400 to-green-400',
};

export default function StatCard({ title, value, icon, color = 'blue' }) {
  return (
    <div className="bg-white rounded-xl p-5 flex items-center gap-4 shadow-card transition-all hover:-translate-y-1 hover:shadow-cardLg">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl text-white bg-gradient-to-br ${COLORS[color]}`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{title}</h3>
        <p className="text-xl font-bold text-dark">{value}</p>
      </div>
    </div>
  );
}
