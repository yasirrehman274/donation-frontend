import axiosClient from './axiosClient';

const RESOURCE = '/donors';

export const donorApi = {
  getAll: () => axiosClient.get(RESOURCE),
  getById: (id) => axiosClient.get(`${RESOURCE}/${id}`),
  create: (data) => axiosClient.post(RESOURCE, data),
  update: (id, data) => axiosClient.put(`${RESOURCE}/${id}`, data),
  delete: (id) => axiosClient.delete(`${RESOURCE}/${id}`),
};
