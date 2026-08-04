import client from '../client';

export const businessApi = {
  // GET /api/v1/businesses
  list: () => client.get('/v1/businesses'),

  // POST /api/v1/businesses
  create: (data) => client.post('/v1/businesses', data),

  // GET /api/v1/businesses/:id
  get: (id) => client.get(`/v1/businesses/${id}`),

  // PUT /api/v1/businesses/:id
  update: (id, data) => client.put(`/v1/businesses/${id}`, data),

  // GET /api/v1/businesses/:id/members
  members: (id) => client.get(`/v1/businesses/${id}/members`),

  // POST /api/v1/businesses/:id/invite
  invite: (id, data) => client.post(`/v1/businesses/${id}/invite`, data),

  // DELETE /api/v1/businesses/:id/members/:userId
  removeMember: (businessId, userId) =>
    client.delete(`/v1/businesses/${businessId}/members/${userId}`),
};
