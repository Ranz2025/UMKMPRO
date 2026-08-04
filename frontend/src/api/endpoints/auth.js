import client from '../client';

export const authApi = {
  // POST /api/v1/auth/login
  login: (data) => client.post('/v1/auth/login', data),

  // POST /api/v1/auth/register
  register: (data) => client.post('/v1/auth/register', data),

  // POST /api/v1/auth/logout
  logout: () => client.post('/v1/auth/logout'),

  // GET /api/v1/auth/me
  me: () => client.get('/v1/auth/me'),

  // POST /api/v1/auth/forgot-password
  forgotPassword: (email) => client.post('/v1/auth/forgot-password', { email }),

  // POST /api/v1/auth/reset-password
  resetPassword: (data) => client.post('/v1/auth/reset-password', data),

  // POST /api/v1/auth/email/verify/{id}/{hash}
  verifyEmail: (url) => client.get(url),

  // POST /api/v1/auth/email/resend
  resendVerification: () => client.post('/v1/auth/email/resend'),
};
