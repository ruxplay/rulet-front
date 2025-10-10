// src/common/constants/Paths.ts
export default {
  Base: '/api',
  Users: { Base: '/users', Get: '/all',  Update: '/update', Delete: '/delete/:id' },
  Auth: { Base: '/auth', Register: '/register', Login: '/login', Usernames: '/usernames', PasswordReset: '/password/reset' },
  Withdrawals: { 
    Base: '/withdrawals', 
    Request: '/request', 
    User: '/user/:username', 
    Pending: '/pending', 
    All: '/all', 
    UpdateStatus: '/:id/status' 
  },
  Deposits: {
    Base: '/deposits',
    Create: '/',
    User: '/user/:username',
    Pending: '/pending',
    All: '/all',
    UpdateStatus: '/:id/status'
  },
  UsdtRates: {
    Base: '/usdt-rates',
    Current: '/current',
    History: '/history',
    Create: '/',
    Update: '/:id',
    UpdateFromAPI: '/update-from-api'
  },
  SystemConfig: {
    Base: '/system-config',
    GetAll: '/',
    GetByKey: '/:key',
    GetValue: '/:key/value',
    GetByCategory: '/category/:category',
    Create: '/',
    Update: '/:key',
    BulkUpdate: '/bulk',
    Delete: '/:key',
    GetCategories: '/meta/categories'
  }
} as const;