import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '@/lib/api/config';

// Base URL usando la configuración centralizada
const baseUrl = API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.USERS;

// Interfaces basadas en memoria-backend.md
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string | null;
  balance: string;
  blockedBalance: string;
  wins: number;
  losses: number;
  role: 'user' | 'admin';
  isActive?: boolean; // Opcional porque el backend puede no devolverlo
  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  users: User[];
}

export interface UserResponse {
  user: User;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  fullName?: string;
  phone?: string;
  balance?: string;
  wins?: number;
  losses?: number;
  role?: 'user' | 'admin';
}

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      console.log('📤 HEADERS ENVIADOS:', Object.fromEntries(headers.entries()));
      return headers;
    },
    // Manejar errores de parsing
    responseHandler: async (response) => {
      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Expected JSON response but got ${contentType}`);
      }
      
      return response.json();
    },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // Obtener todos los usuarios (admin) - activos e inactivos
    getAllUsers: builder.query<UsersResponse, void>({
      query: () => '', // Usar endpoint /api/users
      providesTags: (result) =>
        result?.users
          ? [
              ...result.users.map(({ id }) => ({ type: 'User' as const, id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),
    
    // Obtener usuario por username
    getUserByUsername: builder.query<UserResponse, string>({
      query: (username) => `/${username}`,
      providesTags: (result, error, username) => [{ type: 'User', id: username }],
    }),
    
    // Actualizar usuario
    updateUser: builder.mutation<UserResponse, { id: number; data: UpdateUserRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),
    
    // Eliminar usuario
    deleteUser: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/delete/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),
    
    // Reactivar usuario
    reactivateUser: builder.mutation<UserResponse, number>({
      query: (id) => ({
        url: `/reactivate/${id}`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserByUsernameQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useReactivateUserMutation,
} = usersApi;
