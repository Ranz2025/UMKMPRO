import client from '../client';

export const customersApi = {
  list: (params = {}) => client.get('/v1/customers', { params }),
  get: (id) => client.get(`/v1/customers/${id}`),
  create: (data) => client.post('/v1/customers', data),
  update: (id, data) => client.put(`/v1/customers/${id}`, data),
  delete: (id) => client.delete(`/v1/customers/${id}`),
};

export const suppliersApi = {
  list: (params = {}) => client.get('/v1/suppliers', { params }),
  get: (id) => client.get(`/v1/suppliers/${id}`),
  create: (data) => client.post('/v1/suppliers', data),
  update: (id, data) => client.put(`/v1/suppliers/${id}`, data),
  delete: (id) => client.delete(`/v1/suppliers/${id}`),
};
