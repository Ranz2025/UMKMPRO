import client from '../client';

export const expensesApi = {
  list: (params = {}) => client.get('/v1/expenses', { params }),
  get: (id) => client.get(`/v1/expenses/${id}`),
  create: (data) => client.post('/v1/expenses', data),
  update: (id, data) => client.put(`/v1/expenses/${id}`, data),
  delete: (id) => client.delete(`/v1/expenses/${id}`),
};
