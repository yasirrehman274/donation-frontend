import { io } from 'socket.io-client';
import { getAuthToken } from '../utils/authStorage';

const SOCKET_URL = 'http://localhost:5000';

let socket = null;

const createSocket = (token) =>
  io(SOCKET_URL, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  });

export const connectSocket = () => {
  if (socket) return socket;
  socket = createSocket(getAuthToken() || '');
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
