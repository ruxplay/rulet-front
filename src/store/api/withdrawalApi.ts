import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '@/lib/api/config';
import type {
  Withdrawal,
  CreateWithdrawalRequest,
  CreateWithdrawalResponse,
  WithdrawalEligibilityResponse,
  AllowedMethodsResponse,
  GetWithdrawalsResponse,
} from '@/types';

export const withdrawalApi = createApi({
  reducerPath: 'withdrawalApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_CONFIG.BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['Withdrawal'],
  endpoints: (builder) => ({
    // Crear solicitud de retiro
    createWithdrawal: builder.mutation<CreateWithdrawalResponse, CreateWithdrawalRequest>({
      query: (data) => ({
        url: `${API_CONFIG.ENDPOINTS.WITHDRAWALS}/request`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Withdrawal'],
    }),

    // Verificar elegibilidad
    checkEligibility: builder.query<WithdrawalEligibilityResponse, string>({
      query: (username) => `${API_CONFIG.ENDPOINTS.WITHDRAWALS}/eligibility/${username}`,
      providesTags: ['Withdrawal'],
    }),

    // Obtener métodos de pago permitidos
    getAllowedMethods: builder.query<AllowedMethodsResponse, string>({
      query: (username) => `${API_CONFIG.ENDPOINTS.WITHDRAWALS}/allowed-methods/${username}`,
      providesTags: ['Withdrawal'],
    }),

    // Obtener retiros del usuario
    getUserWithdrawals: builder.query<GetWithdrawalsResponse, string>({
      query: (username) => `${API_CONFIG.ENDPOINTS.WITHDRAWALS}/user/${username}`,
      providesTags: ['Withdrawal'],
    }),
  }),
});

export const {
  useCreateWithdrawalMutation,
  useCheckEligibilityQuery,
  useGetAllowedMethodsQuery,
  useGetUserWithdrawalsQuery,
} = withdrawalApi;

