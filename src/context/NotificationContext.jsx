import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../api/notificationApi';
import { connectSocket, disconnectSocket } from '../services/socketClient';

const NotificationContext = createContext();
export const useNotifications = () => useContext(NotificationContext);

const POLL_INTERVAL = 30000;

export const NotificationProvider = ({ children }) => {
  const { token, user } = useAuth();
  const isAdmin = user && user.role === 'admin';

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const pollTimer = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const [list, count] = await Promise.all([fetchNotifications(), fetchUnreadCount()]);
      setNotifications(list || []);
      setUnreadCount(count ? count.count : 0);
    } catch {
      // Backend unreachable: keep last known state; polling will retry.
    }
  }, []);

  const startPolling = useCallback(() => {
    if (pollTimer.current) return;
    pollTimer.current = setInterval(refresh, POLL_INTERVAL);
  }, [refresh]);

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  }, []);

  useEffect(() => {
    if (!token || !isAdmin) return undefined;

    refresh();

    const socket = connectSocket();

    const onConnect = () => {
      setConnected(true);
      stopPolling();
      refresh();
    };
    const onDisconnect = () => {
      setConnected(false);
      startPolling();
    };
    const onConnectError = () => {
      setConnected(false);
      startPolling();
    };
    const onNewDonation = (payload) => {
      if (!payload) return;
      setNotifications((prev) => [payload, ...prev.filter((n) => n.id !== payload.id)]);
      setUnreadCount((prev) => prev + (payload.isRead ? 0 : 1));
    };
    const onUpdated = () => refresh();

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('new-donation', onNewDonation);
    socket.on('notifications-updated', onUpdated);

    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('new-donation', onNewDonation);
      socket.off('notifications-updated', onUpdated);
      stopPolling();
      disconnectSocket();
    };
  }, [token, isAdmin, refresh, startPolling, stopPolling]);

  const markRead = useCallback(
    async (id) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      try {
        await markNotificationRead(id);
      } catch {
        refresh();
      }
    },
    [refresh]
  );

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch {
      refresh();
    }
  }, [refresh]);

  const value = useMemo(
    () => ({ notifications, unreadCount, connected, markRead, markAllRead, refresh }),
    [notifications, unreadCount, connected, markRead, markAllRead, refresh]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
