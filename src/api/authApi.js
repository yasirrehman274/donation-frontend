import axiosClient from './axiosClient';

export const authApi = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  register: (data) => axiosClient.post('/auth/register', data),
  profile: () => axiosClient.get('/auth/profile'),
  updateProfile: (data) => axiosClient.put('/auth/profile', data),
  changePassword: (data) => axiosClient.put('/auth/change-password', data),
};
