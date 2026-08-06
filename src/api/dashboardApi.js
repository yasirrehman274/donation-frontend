import axiosClient from './axiosClient';

export const dashboardApi = {
  index: () => axiosClient.get('/dashboard'),
  mine: () => axiosClient.get('/dashboard/mine'),
};
