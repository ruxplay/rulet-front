import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '@/lib/api/config';

export interface Deposit {
  id: number;
  username: string;
  fullName?: string | null;
  amount: number;
  reference: string;
  bank: string;
  receiptUrl: string;
  receiptPublicId: string;
  receiptFormat: string;
  receiptBytes: number;
  status: 'pending' | 'approved' | 'rejected';
  paymentMethod: 'bank_transfer' | 'usdt' | 'pago_movil';
  usdtAmount?: number | null;
  exchangeRate?: number | null;
  walletAddress?: string | null;
  transactionHash?: string | null;
  createdAt: string;
  updatedAt: string;
  processedAt?: string | null;
  processedBy?: string | null;
  notes?: string | null;
}

export interface DepositsResponse {
  deposits: Deposit[];
}

export interface UpdateDepositStatusRequest {
  status: 'pending' | 'approved' | 'rejected';
  processedBy: string;
  notes?: string;
}

export interface UpdateDepositStatusResponse {
  message: string;
  deposit: Deposit;
}

export interface DepositStats {
  totalDeposits: number;
  pendingDeposits: number;
  approvedDeposits: number;
  rejectedDeposits: number;
  totalAmount: number;
}

export const adminDepositsApi = createApi({
  reducerPath: 'adminDepositsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_CONFIG.BASE_URL}/api/deposits`,
    credentials: 'include',
  }),
  tagTypes: ['Deposit'],
  endpoints: (builder) => ({
    // Obtener todos los depósitos con filtros (usando el endpoint correcto del backend)
    getAllDeposits: builder.query<DepositsResponse, {
      status?: string;
      username?: string;
      dateFrom?: string;
      dateTo?: string;
      limit?: number;
      offset?: number;
    }>({
      query: (params) => ({
        url: '/all', // Cambiar a /all para obtener todos los depósitos
        params,
      }),
      providesTags: (result) =>
        result?.deposits
          ? [
              ...result.deposits.map(({ id }) => ({ type: 'Deposit' as const, id })),
              { type: 'Deposit', id: 'LIST' },
            ]
          : [{ type: 'Deposit', id: 'LIST' }],
    }),

    // Obtener depósitos pendientes
    getPendingDeposits: builder.query<DepositsResponse, void>({
      query: () => '/pending',
      providesTags: (result) =>
        result?.deposits
          ? [
              ...result.deposits.map(({ id }) => ({ type: 'Deposit' as const, id })),
              { type: 'Deposit', id: 'PENDING' },
            ]
          : [{ type: 'Deposit', id: 'PENDING' }],
    }),

    // Obtener estadísticas de depósitos
    getDepositStats: builder.query<DepositStats, void>({
      query: () => '/stats',
      providesTags: [{ type: 'Deposit', id: 'STATS' }],
    }),

    // Actualizar estado de depósito
    updateDepositStatus: builder.mutation<UpdateDepositStatusResponse, {
      id: number;
      data: UpdateDepositStatusRequest;
    }>({
      query: ({ id, data }) => ({
        url: `/${id}/status`,
        method: 'PUT',
        body: data,
      }),
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        try {
          console.log('🚀 RTK Query - Iniciando actualización de depósito:', { id, data });
          const result = await queryFulfilled;
          console.log('✅ RTK Query - Actualización exitosa:', result.data);
        } catch (error) {
          console.error('❌ RTK Query - Error en actualización:', error);
          // El error se propagará automáticamente
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Deposit', id },
        { type: 'Deposit', id: 'LIST' },
        { type: 'Deposit', id: 'PENDING' },
        { type: 'Deposit', id: 'STATS' },
      ],
    }),

    // Obtener depósito por ID
    getDepositById: builder.query<{ deposit: Deposit }, number>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Deposit', id }],
    }),
  }),
});

export const {
  useGetAllDepositsQuery,
  useGetPendingDepositsQuery,
  useGetDepositStatsQuery,
  useUpdateDepositStatusMutation,
  useGetDepositByIdQuery,
} = adminDepositsApi;
