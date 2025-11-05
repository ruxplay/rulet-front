// lib/api/config.ts
// Configuración automática por entorno
const getBaseURL = (): string => {
  // Si existe variable de entorno, usarla (para override manual)
  // Validar que tenga protocolo y normalizar
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    let url = envUrl.trim();
    // Asegurar que tenga protocolo
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    // Remover trailing slash
    const normalizedUrl = url.replace(/\/+$/, '');
    if (normalizedUrl) {
      return normalizedUrl;
    }
  }
  
  // Detectar entorno automáticamente
  const isClient = typeof window !== 'undefined';
  const nodeEnv = process.env.NODE_ENV;
  const isProduction = nodeEnv === 'production';
  
  // Detectar producción por hostname (si estamos en el cliente)
  let isProductionByHostname = false;
  if (isClient && typeof window.location !== 'undefined') {
    const hostname = window.location.hostname;
    // Si el hostname contiene 'vercel.app' o no es 'localhost', asumimos producción
    isProductionByHostname = !hostname.includes('localhost') && 
                              !hostname.includes('127.0.0.1') && 
                              hostname !== '';
  }
  
  // Si estamos en producción (detectado por NODE_ENV o por hostname), usar backend de producción
  if (isProduction || isProductionByHostname) {
    return 'https://ruleta-backend-12.onrender.com';
  }
  
  // Fallback absoluto: desarrollo local por defecto
  // Esto asegura que siempre retornamos un valor válido
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
