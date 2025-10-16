import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '@/lib/api/config';
import { setUser, clearUser } from '@/store/slices/authSlice';

// Base URL de tu API (ajústala si usas .env)
const baseUrl = API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH;

// Configuración del API
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: 'include', // ✅ importante para enviar cookies JWT o sesiones
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Auth'],

  endpoints: (builder) => ({
    // 📝 REGISTER
    register: builder.mutation<{ user: unknown }, { username: string; email: string; password: string; fullName: string } | Record<string, unknown>>({
      query: (registerData) => ({
        url: '/register',
        method: 'POST',
        body: registerData,
      }),
      transformResponse: (response: { user?: unknown; data?: { user?: unknown } } | unknown) => {
        // Verificar que response es un objeto antes de acceder a sus propiedades
        if (response && typeof response === 'object' && 'user' in response) {
          const responseObj = response as { user?: unknown; data?: { user?: unknown } };
          return { user: responseObj.user || response };
        }
        if (response && typeof response === 'object' && 'data' in response) {
          const responseObj = response as { data?: { user?: unknown } };
          if (responseObj.data?.user) {
            return { user: responseObj.data.user };
          }
        }
        return { user: response };
      },
      invalidatesTags: ['Auth'],
    }),

    // 🔑 LOGIN
    login: builder.mutation<{ user: unknown }, { username?: string; email?: string; password: string } | Record<string, unknown>>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: { user?: unknown; data?: { user?: unknown } } | unknown) => {
        // Verificar que response es un objeto antes de acceder a sus propiedades
        if (response && typeof response === 'object' && 'user' in response) {
          const responseObj = response as { user?: unknown; data?: { user?: unknown } };
          return { user: responseObj.user || response };
        }
        if (response && typeof response === 'object' && 'data' in response) {
          const responseObj = response as { data?: { user?: unknown } };
          if (responseObj.data?.user) {
            return { user: responseObj.data.user };
          }
        }
        return { user: response };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.user) {
            dispatch(setUser(data.user as unknown as { id: number; username: string; email: string; fullName: string; role?: 'user' | 'admin'; balance?: number | string }));
          }
        } catch {
          dispatch(clearUser());
        }
      },
    }),

    // 👁️‍🗨️ VERIFICAR AUTENTICACIÓN (para persistencia)
    verifyAuth: builder.query<{ user: unknown | null }, void>({
      query: () => ({
        url: '/verify',
        method: 'GET',
      }),
      transformResponse: (response: { user?: unknown; data?: { user?: unknown } } | unknown) => {
        // Verificar que response es un objeto antes de acceder a sus propiedades
        if (response && typeof response === 'object' && 'user' in response) {
          const responseObj = response as { user?: unknown; data?: { user?: unknown } };
          return { user: responseObj.user || null };
        }
        if (response && typeof response === 'object' && 'data' in response) {
          const responseObj = response as { data?: { user?: unknown } };
          if (responseObj.data?.user) {
            return { user: responseObj.data.user };
          }
        }
        return { user: null };
      },
      providesTags: ['Auth'],
    }),

    // 🚪 LOGOUT
    logout: builder.mutation({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          console.warn('Logout backend falló, limpiando localmente.');
        } finally {
          dispatch(clearUser());
        }
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useVerifyAuthQuery,
  useLogoutMutation,
} = authApi;
