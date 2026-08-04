import client from '../client';

export const reportsApi = {
  // GET /api/v1/reports/dashboard?period=today|week|month|year
  dashboard: (period = 'today') =>
    client.get('/v1/reports/dashboard', { params: { period } }),

  // GET /api/v1/reports/profit-loss?start_date=&end_date=
  profitLoss: (startDate, endDate) =>
    client.get('/v1/reports/profit-loss', { params: { start_date: startDate, end_date: endDate } }),

  // GET /api/v1/reports/sales-summary?start_date=&end_date=&group_by=day|week|month|product|customer
  salesSummary: (params = {}) =>
    client.get('/v1/reports/sales-summary', { params }),
};
