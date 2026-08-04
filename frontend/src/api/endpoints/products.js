import client from '../client';

export const productsApi = {
  // GET /api/v1/products?search=&category_id=&page=&per_page=
  list: (params = {}) => client.get('/v1/products', { params }),

  // GET /api/v1/products/:id
  get: (id) => client.get(`/v1/products/${id}`),

  // POST /api/v1/products (multipart/form-data untuk image)
  create: (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== null && v !== undefined) formData.append(k, v);
    });
    return client.post('/v1/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // PUT /api/v1/products/:id
  update: (id, data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== null && v !== undefined) formData.append(k, v);
    });
    formData.append('_method', 'PUT');
    return client.post(`/v1/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // DELETE /api/v1/products/:id
  delete: (id) => client.delete(`/v1/products/${id}`),

  // GET /api/v1/categories
  categories: () => client.get('/v1/categories'),

  // POST /api/v1/categories
  createCategory: (data) => client.post('/v1/categories', data),
};
