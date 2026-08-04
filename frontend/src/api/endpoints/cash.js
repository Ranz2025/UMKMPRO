import client from '../client';

export const cashApi = {
  getAccounts: () => client.get('/v1/cash/accounts'),
  createAccount: (data) => client.post('/v1/cash/accounts', data),
  getTransactions: (params) => client.get('/v1/cash/transactions', { params }),
  createTransaction: (data) => client.post('/v1/cash/transactions', data),
};
