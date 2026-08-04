import client from '../client';

export const purchasesApi = {
  list: (params = {}) => client.get('/v1/purchases', { params }),
  get: (id) => client.get(`/v1/purchases/${id}`),
  create: (data) => client.post('/v1/purchases', data),
  update: (id, data) => client.put(`/v1/purchases/${id}`, data),
  delete: (id) => client.delete(`/v1/purchases/${id}`),
};
