import axiosClient from './axiosClient';

export const fetchNotifications = (limit = 50) => axiosClient.get(`/notifications?limit=${limit}`);

export const fetchUnreadCount = () => axiosClient.get('/notifications/unread-count');

export const markNotificationRead = (id) => axiosClient.put(`/notifications/${id}/read`);

export const markAllNotificationsRead = () => axiosClient.put('/notifications/read-all');
