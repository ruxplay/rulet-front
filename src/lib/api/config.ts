// lib/api/config.ts
// Configuración automática por entorno
const getBaseURL = (): string => {
  // Si existe variable de entorno, usarla (para override manual)
  // Validar que tenga protocolo y normalizar
  if (process.env.NEXT_PUBLIC_API_URL) {
    let url = process.env.NEXT_PUBLIC_API_URL.trim();
    // Asegurar que tenga protocolo
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    // Remover trailing slash
    return url.replace(/\/+$/, '');
  }
  
  // Detectar entorno automáticamente
  // En el cliente, typeof window !== 'undefined' indica que estamos en el navegador
  // En producción (Vercel), usar siempre el backend de producción
  if (typeof window !== 'undefined') {
    // Estamos en el cliente (navegador)
    // En producción, siempre usar el backend de producción
    if (process.env.NODE_ENV === 'production') {
      return 'https://ruleta-backend-12.onrender.com';
    }
    // En desarrollo local, usar localhost
    return 'http://localhost:3001';
  }
  
  // Estamos en el servidor (SSR/SSG)
  if (process.env.NODE_ENV === 'production') {
    return 'https://ruleta-backend-12.onrender.com';
  }
  
  // Desarrollo local por defecto
  return 'http://localhost:3001';
};

// Función getter para evaluar BASE_URL en tiempo de ejecución
export const getAPIBaseURL = (): string => getBaseURL();

export const API_CONFIG = {
  // Usar getter function para evaluar en tiempo de ejecución en lugar de tiempo de importación
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
