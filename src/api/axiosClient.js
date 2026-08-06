import axios from 'axios';
import { getAuthToken, clearAuth } from '../utils/authStorage';

// Base URL points to the backend API running on port 5000
const axiosClient = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach the JWT so the backend can authenticate every request.
axiosClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 (expired/invalid token) globally.
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearAuth();
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
