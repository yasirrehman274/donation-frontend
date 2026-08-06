import axiosClient from './axiosClient';

const RESOURCE = '/donations';

export const donationApi = {
  getAll: () => axiosClient.get(RESOURCE),
  getById: (id) => axiosClient.get(`${RESOURCE}/${id}`),
  my: () => axiosClient.get(`${RESOURCE}/my`),
  create: (data) => axiosClient.post(RESOURCE, data),
  update: (id, data) => axiosClient.put(`${RESOURCE}/${id}`, data),
  delete: (id) => axiosClient.delete(`${RESOURCE}/${id}`),
  approve: (id) => axiosClient.put(`${RESOURCE}/${id}/approve`),
  reject: (id) => axiosClient.put(`${RESOURCE}/${id}/reject`),
  upload: (file) => {
    const formData = new FormData();
    formData.append('screenshot', file);
    return axiosClient.post(`${RESOURCE}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
