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
            // Verificar si el usuario está activo antes de establecer el estado
            const user = data.user;
            const isUserActive = user && typeof user === 'object' && 'isActive' in user 
              ? (user as Record<string, unknown>).isActive 
              : true; // Si no viene isActive, asumir que está activo
            
            // Solo establecer el usuario si está activo
            if (isUserActive !== false) {
              dispatch(setUser(data.user as unknown as { id: number; username: string; email: string; fullName: string; role?: 'user' | 'admin'; balance?: number | string }));
            } else {
              // Si está inactivo, limpiar el estado y lanzar error
              dispatch(clearUser());
              throw new Error('Usuario inactivo');
            }
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

    // ✏️ ACTUALIZAR PERFIL
    updateProfile: builder.mutation<{ user: unknown }, { userId: number; data: { username?: string; email?: string; fullName?: string; phone?: string | null; password?: string } }>({
      query: ({ userId, data }) => ({
        url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_PROFILE(userId)}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: { user?: unknown } | unknown) => {
        if (response && typeof response === 'object' && 'user' in response) {
          return { user: (response as { user: unknown }).user };
        }
        return { user: response };
      },
      async onQueryStarted({ userId, data }, { dispatch, queryFulfilled }) {
        try {
          const { data: result } = await queryFulfilled;
          if (result?.user) {
            const user = result.user as { id: number; username: string; email: string; fullName: string; role?: 'user' | 'admin'; balance?: number | string; phone?: string | null };
            dispatch(setUser({
              id: user.id,
              username: user.username,
              email: user.email,
              fullName: user.fullName,
              role: user.role,
              balance: user.balance,
            }));
          }
        } catch {
          // Error manejado en el componente
        }
      },
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useVerifyAuthQuery,
  useLogoutMutation,
  useUpdateProfileMutation,
} = authApi;
