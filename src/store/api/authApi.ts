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
    register: builder.mutation({
      query: (registerData) => ({
        url: '/register',
        method: 'POST',
        body: registerData,
      }),
      transformResponse: (response: any) => {
        if (response.user) return response;
        if (response.data?.user) return response.data;
        return { user: response };
      },
      invalidatesTags: ['Auth'],
    }),

    // 🔑 LOGIN
    login: builder.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: any) => {
        // Acepta respuesta flexible desde backend
        if (response.user) return response;
        if (response.data?.user) return response.data;
        return { user: response };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.user) {
            dispatch(setUser(data.user));
          }
        } catch (error) {
          dispatch(clearUser());
        }
      },
    }),

    // 👁️‍🗨️ VERIFICAR AUTENTICACIÓN (para persistencia)
    verifyAuth: builder.query({
      query: () => ({
        url: '/verify',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        if (response.user) return response;
        if (response.data?.user) return response.data;
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
        } catch (err) {
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
