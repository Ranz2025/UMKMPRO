import client from '../client';

export const salesApi = {
  // GET /api/v1/sales?page=&per_page=&search=&status=&start_date=&end_date=
  list: (params = {}) => client.get('/v1/sales', { params }),

  // GET /api/v1/sales/:id
  get: (id) => client.get(`/v1/sales/${id}`),

  // POST /api/v1/sales
  // body: { customer_id?, payment_method, discount_amount?, tax_amount?, notes?, items: [{product_id, quantity, unit_price}] }
  create: (data) => client.post('/v1/sales', data),

  // POST /api/v1/sales/payments/qris
  createQris: (data) => client.post('/v1/sales/payments/qris', data),

  // POST /api/v1/sales/:id/cancel
  cancel: (id) => client.post(`/v1/sales/${id}/cancel`),
};
