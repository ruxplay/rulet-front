import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '@/lib/api/config';
import { Withdrawal, WithdrawalStatus } from '@/types';

export interface WithdrawalWithUser extends Withdrawal {
  user?: {
    fullName: string;
    email: string;
  };
}

export interface WithdrawalsResponse {
  withdrawals: WithdrawalWithUser[];
}

export interface UpdateWithdrawalStatusRequest {
  status: 'approved' | 'rejected';
  processedBy: string;
  notes?: string;
}

export interface UpdateWithdrawalStatusResponse {
  withdrawal: WithdrawalWithUser;
}

export interface WithdrawalStats {
  totalWithdrawals: number;
  pendingWithdrawals: number;
  approvedWithdrawals: number;
  rejectedWithdrawals: number;
  totalAmount: number;
}

export const adminWithdrawalsApi = createApi({
  reducerPath: 'adminWithdrawalsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_CONFIG.BASE_URL}/api/withdrawals`,
    credentials: 'include',
  }),
  tagTypes: ['Withdrawal'],
  endpoints: (builder) => ({
    // Obtener todos los retiros con filtros
    getAllWithdrawals: builder.query<WithdrawalsResponse, {
      status?: string;
      username?: string;
      dateFrom?: string;
      dateTo?: string;
      limit?: number;
      offset?: number;
    }>({
      query: (params) => ({
        url: '/all',
        params,
      }),
      providesTags: (result) =>
        result?.withdrawals
          ? [
              ...result.withdrawals.map(({ id }) => ({ type: 'Withdrawal' as const, id })),
              { type: 'Withdrawal', id: 'LIST' },
            ]
          : [{ type: 'Withdrawal', id: 'LIST' }],
    }),

    // Obtener retiros pendientes
    getPendingWithdrawals: builder.query<WithdrawalsResponse, void>({
      query: () => '/pending',
      providesTags: (result) =>
        result?.withdrawals
          ? [
              ...result.withdrawals.map(({ id }) => ({ type: 'Withdrawal' as const, id })),
              { type: 'Withdrawal', id: 'PENDING' },
            ]
          : [{ type: 'Withdrawal', id: 'PENDING' }],
    }),

    // Actualizar estado de retiro (aprobar o rechazar)
    updateWithdrawalStatus: builder.mutation<UpdateWithdrawalStatusResponse, {
      id: number;
      data: UpdateWithdrawalStatusRequest;
    }>({
      query: ({ id, data }) => ({
        url: `/${id}/status`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Withdrawal', id },
        { type: 'Withdrawal', id: 'LIST' },
        { type: 'Withdrawal', id: 'PENDING' },
      ],
    }),

    // Obtener retiro por ID
    getWithdrawalById: builder.query<{ withdrawal: WithdrawalWithUser }, number>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Withdrawal', id }],
    }),
  }),
});

export const {
  useGetAllWithdrawalsQuery,
  useGetPendingWithdrawalsQuery,
  useUpdateWithdrawalStatusMutation,
  useGetWithdrawalByIdQuery,
} = adminWithdrawalsApi;

