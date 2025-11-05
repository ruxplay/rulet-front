// lib/api/config.ts
// Configuración automática por entorno
const getBaseURL = (): string => {
  // 🔍 DEBUG: Log para verificar valores en producción
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  const nodeEnv = process.env.NODE_ENV;
  const isClient = typeof window !== 'undefined';
  
  console.log('🔍 [getBaseURL] Debug:', {
    NEXT_PUBLIC_API_URL: envUrl,
    NODE_ENV: nodeEnv,
    isClient,
    windowAvailable: typeof window !== 'undefined',
    location: typeof window !== 'undefined' ? window.location?.hostname : 'N/A'
  });
  
  // Si existe variable de entorno, usarla (para override manual)
  // Validar que tenga protocolo y normalizar
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    let url = envUrl.trim();
    // Asegurar que tenga protocolo
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    // Remover trailing slash
    const finalUrl = url.replace(/\/+$/, '');
    console.log('🔍 [getBaseURL] Usando NEXT_PUBLIC_API_URL:', finalUrl);
    return finalUrl;
  }
  
  // Detectar entorno automáticamente
  // En el cliente, typeof window !== 'undefined' indica que estamos en el navegador
  // En producción (Vercel), usar siempre el backend de producción
  if (isClient) {
    // Estamos en el cliente (navegador)
    // En producción, siempre usar el backend de producción
    if (nodeEnv === 'production') {
      console.log('🔍 [getBaseURL] Cliente + Producción: usando backend de producción');
      return 'https://ruleta-backend-12.onrender.com';
    }
    // En desarrollo local, usar localhost
    console.log('🔍 [getBaseURL] Cliente + Desarrollo: usando localhost');
    return 'http://localhost:3001';
  }
  
  // Estamos en el servidor (SSR/SSG)
  if (nodeEnv === 'production') {
    console.log('🔍 [getBaseURL] Servidor + Producción: usando backend de producción');
    return 'https://ruleta-backend-12.onrender.com';
  }
  
  // Desarrollo local por defecto
  console.log('🔍 [getBaseURL] Fallback: usando localhost');
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
