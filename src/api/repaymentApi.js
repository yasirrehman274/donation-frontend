import axiosClient from './axiosClient';

const RESOURCE = '/repayments';

export const repaymentApi = {
  getAll: () => axiosClient.get(RESOURCE),
  getByLoanId: (loanId) => axiosClient.get(`${RESOURCE}?loanId=${loanId}`),
  create: (data) => axiosClient.post(RESOURCE, data),
  delete: (id) => axiosClient.delete(`${RESOURCE}/${id}`),
};
