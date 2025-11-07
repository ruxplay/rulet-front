export const APP_CONFIG = {
    name: 'RubPlay',
    description: 'La mejor experiencia de ruleta online',
    version: '1.0.0',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  } as const;
  
  export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    GAME: '/game',
    ADMIN: '/admin',
  } as const;
  
  export const API_ENDPOINTS = {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      VERIFY: '/api/auth/verify',
    },
    USER: {
      PROFILE: '/api/user/profile',
      BALANCE: '/api/user/balance',
    },
  } as const;