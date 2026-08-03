import axiosClient from './axiosClient';

const RESOURCE = '/loans';

export const loanApi = {
  getAll: () => axiosClient.get(RESOURCE),
  getById: (id) => axiosClient.get(`${RESOURCE}/${id}`),
  create: (data) => axiosClient.post(RESOURCE, data),
  update: (id, data) => axiosClient.patch(`${RESOURCE}/${id}`, data),
  delete: (id) => axiosClient.delete(`${RESOURCE}/${id}`),
};
