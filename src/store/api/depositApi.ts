import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '@/lib/api/config';

export interface Deposit {
  id: number;
  username: string;
  fullName?: string;
  amount: number;
  reference: string;
  bank: string;
  receiptUrl: string;
  receiptPublicId: string;
  receiptFormat: string;
  receiptBytes: number;
  status: 'pending' | 'approved' | 'rejected';
  paymentMethod: 'bank_transfer' | 'usdt' | 'pago_movil';
  usdtAmount?: number;
  exchangeRate?: number;
  walletAddress?: string;
  transactionHash?: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
}

export interface CreateDepositRequest {
  username: string;
  amount: number;
  reference: string;
  bank: string;
  receiptUrl: string;
  receiptPublicId: string;
  receiptFormat: string;
  receiptBytes: number;
  paymentMethod: 'bank_transfer' | 'usdt' | 'pago_movil';
  usdtAmount?: number;
  exchangeRate?: number;
  walletAddress?: string;
  transactionHash?: string;
}

export interface UsdtRate {
  id: number;
  rate: number;
  source: 'binance' | 'coingecko' | 'manual';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface UsdtRateStatus {
  currentRate: UsdtRate | null;
  lastUpdate: string | null;
  isStale: boolean;
  source: string;
}

export const depositApi = createApi({
  reducerPath: 'depositApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_CONFIG.BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['Deposit', 'UsdtRate'],
  endpoints: (builder) => ({
    // Crear depósito
    createDeposit: builder.mutation<{ deposit: Deposit }, CreateDepositRequest>({
      query: (data) => ({
        url: `${API_CONFIG.ENDPOINTS.DEPOSITS}/`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Deposit'],
    }),

    // Obtener depósitos del usuario
    getUserDeposits: builder.query<{ deposits: Deposit[] }, string>({
      query: (username) => `${API_CONFIG.ENDPOINTS.DEPOSITS}/user/${username}`,
      providesTags: ['Deposit'],
    }),

    // Obtener tasa USDT actual
    getCurrentUsdtRate: builder.query<UsdtRateStatus, void>({
      query: () => `${API_CONFIG.ENDPOINTS.USDT_RATES}/current`,
      providesTags: ['UsdtRate'],
    }),
  }),
});

export const {
  useCreateDepositMutation,
  useGetUserDepositsQuery,
  useGetCurrentUsdtRateQuery,
} = depositApi;
