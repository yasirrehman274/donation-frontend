import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { timeAgo } from '../../utils/helpers';

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, refresh } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const handleOpen = () => {
    refresh();
    setOpen((v) => !v);
  };

  const handleClickItem = (n) => {
    if (!n.isRead) markRead(n.id);
    setOpen(false);
    navigate('/admin/donations');
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={handleOpen}
        className="relative text-dark hover:text-primary transition-colors text-lg px-2 py-1"
        aria-label="Notifications"
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-danger text-white text-[10px] font-semibold flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[340px] max-w-[90vw] bg-white shadow-cardLg rounded-lg border border-gray-100 z-[1000] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-dark text-sm">Notifications</h3>
            <button
              onClick={markAllRead}
              className="text-xs text-primary hover:underline"
              disabled={unreadCount === 0}
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-gray-400 text-sm">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleClickItem(n)}
                  className={`cursor-pointer px-4 py-3 flex gap-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    n.isRead ? 'opacity-60' : 'bg-blue-50/40'
                  }`}
                >
                  <div className={`mt-0.5 ${n.isRead ? 'text-gray-300' : 'text-primary'}`}>
                    <i className="fas fa-bell"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${n.isRead ? 'text-gray-500' : 'text-dark font-semibold'}`}>
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <div className="flex flex-col items-end justify-between shrink-0">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markRead(n.id);
                        }}
                        className="text-[11px] text-primary hover:underline"
                      >
                        Mark as read
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
