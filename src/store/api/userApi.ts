import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '@/lib/api/config';

// Base URL de tu API
const baseUrl = API_CONFIG.BASE_URL;

// Configuración del API de usuarios
export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: 'include', // Para enviar cookies JWT
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['User'],

  endpoints: (builder) => ({
    // GET usuario por username
    getUserByUsername: builder.query({
      query: (username) => `/api/users/${username}`,
      providesTags: ['User'],
    }),
  }),
});

export const {
  useGetUserByUsernameQuery,
} = userApi;
