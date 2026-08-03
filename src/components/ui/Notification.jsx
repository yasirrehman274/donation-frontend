import React from 'react';

const TYPE_STYLES = {
  success: 'bg-success',
  error: 'bg-danger',
  info: 'bg-info',
};

export default function Notification({ notification }) {
  return (
    <div
      className={`fixed top-5 right-5 px-6 py-3.5 rounded-lg text-white text-sm font-semibold z-[3000] shadow-cardLg max-w-sm transition-transform duration-400 ${
        TYPE_STYLES[notification.type] || 'bg-info'
      } ${notification.show ? 'translate-x-0' : 'translate-x-[120%]'}`}
    >
      {notification.message}
    </div>
  );
}
