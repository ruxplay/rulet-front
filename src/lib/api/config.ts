// lib/api/config.ts
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  ENDPOINTS: {
    AUTH: '/api/auth',
    USER: '/api/user',
    USERS: '/api/users',
    DASHBOARD: '/api/dashboard',
    RULETA: '/api/roulette',
    SUPPORT: '/api/support',
    DEPOSITS: '/api/deposits',
    USDT_RATES: '/api/usdt-rates'
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
      STREAM: '/api/roulette/stream',
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
