// lib/api/config.ts
// Configuración automática por entorno
const getBaseURL = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  const nodeEnv = process.env.NODE_ENV;
  const isClient = typeof window !== 'undefined';

  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    let url = envUrl.trim();
 
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    
    const finalUrl = url.replace(/\/+$/, '');
    return finalUrl;
  }
  
 
  if (isClient) {

    if (nodeEnv === 'production') {
      return 'https://rubplay-backend-2.onrender.com';
    }
   
    return 'http://localhost:3001';
  }
  
  if (nodeEnv === 'production') {
    return 'https://rubplay-backend-2.onrender.com';
  }
  

  return 'http://localhost:3001';
};

export const getAPIBaseURL = (): string => getBaseURL();

export const API_CONFIG = {

  get BASE_URL() {
    return getBaseURL();
  },
  ENDPOINTS: {
    AUTH: '/api/auth',
    AUTH_PASSWORD_FORGOT: '/api/auth/password/forgot',
    AUTH_PASSWORD_VERIFY: '/api/auth/password/verify',
    AUTH_PASSWORD_RESET: '/api/auth/password/reset',
    USER: '/api/user',
    USERS: '/api/users',
    USER_PROFILE: (userId: number) => `/api/users/${userId}/profile`,
    DASHBOARD: '/api/dashboard',
    RULETA: '/api/roulette',
    SUPPORT: '/api/support',
    DEPOSITS: '/api/deposits',
    USDT_RATES: '/api/usdt-rates',
    WITHDRAWALS: '/api/withdrawals'
  },
  // Configuración específica para ruleta
  RULETA: {
    TYPES: ['150', '300'] as const,
    NUM_SECTORS: 15,
    BET_AMOUNTS: {
      '150': 150,
      '300': 300
    },
    SSE_ENDPOINTS: {
      STREAM: '/api/roulette/stream',  // Stream unificado para ambas ruletas + eventos de usuario
      TYPE_STREAM: (type: '150' | '300') => `/api/roulette/${type}/stream`
    }
  }
};

// Types para el registro
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface RegisterResponse {
  user: {
    id: number;
    username: string;
    email: string;
    fullName: string;
  };
}

export interface AuthError {
  error: string;
}
