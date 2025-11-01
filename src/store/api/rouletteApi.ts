import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '@/lib/api/config';
import { SubmitSpinResultRequest, SubmitSpinResultResponse } from '@/types';

// Base URL de tu API
const baseUrl = API_CONFIG.BASE_URL;

// Configuración del API de ruleta
export const rouletteApi = createApi({
  reducerPath: 'rouletteApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: 'include', // Para enviar cookies JWT
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Roulette', 'RouletteMesa', 'RouletteBet'],
  keepUnusedDataFor: 30, // Mantener datos por 30 segundos

  endpoints: (builder) => ({
    // Obtener mesa actual de una ruleta específica
    getCurrentMesa: builder.query({
      query: (type: '150' | '300') => `${API_CONFIG.ENDPOINTS.RULETA}/${type}/current`,
      providesTags: (result, error, type) => [
        { type: 'RouletteMesa', id: type },
        { type: 'Roulette', id: type }
      ],
    }),

    // Realizar apuesta
    placeBet: builder.mutation({
      query: ({ type, ...betData }) => ({
        url: `${API_CONFIG.ENDPOINTS.RULETA}/${type}/bet`,
        method: 'POST',
        body: betData,
      }),
      invalidatesTags: (result, error, { type }) => [
        { type: 'RouletteMesa', id: type },
        { type: 'Roulette', id: type }
      ],
    }),

    // Enviar resultado de ruleta física
    submitSpinResult: builder.mutation<SubmitSpinResultResponse, { type: '150' | '300'; data: SubmitSpinResultRequest }>({
      query: ({ type, data }) => ({
        url: `${API_CONFIG.ENDPOINTS.RULETA}/${type}/submit-result`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { type }) => [
        { type: 'RouletteMesa', id: type },
        { type: 'Roulette', id: type }
      ],
    }),

    // Girar la ruleta (OBSOLETO - usar submitSpinResult)
    spinMesa: builder.mutation({
      query: ({ type, mesaId }) => ({
        url: `${API_CONFIG.ENDPOINTS.RULETA}/${type}/spin`,
        method: 'POST',
        body: { mesaId },
      }),
      invalidatesTags: (result, error, { type }) => [
        { type: 'RouletteMesa', id: type },
        { type: 'Roulette', id: type }
      ],
    }),

    // Avanzar a la siguiente mesa
    advanceMesa: builder.mutation({
      query: ({ type, closedMesaId }) => ({
        url: `${API_CONFIG.ENDPOINTS.RULETA}/${type}/advance`,
        method: 'POST',
        body: { closedMesaId },
      }),
      invalidatesTags: (result, error, { type }) => [
        { type: 'RouletteMesa', id: type },
        { type: 'Roulette', id: type }
      ],
    }),

    // Obtener reporte de ganancias de la casa
    getHouseReport: builder.query({
      query: ({ type, dateFrom, dateTo }) => ({
        url: `${API_CONFIG.ENDPOINTS.RULETA}/${type}/report`,
        params: { dateFrom, dateTo },
      }),
      providesTags: (result, error, { type }) => [
        { type: 'Roulette', id: `${type}-report` }
      ],
    }),

    // Obtener últimos ganadores
    getLastWinners: builder.query({
      query: ({ type, limit = 10 }) => ({
        url: `${API_CONFIG.ENDPOINTS.RULETA}/${type}/winners`,
        params: { limit },
      }),
      providesTags: (result, error, { type }) => [
        { type: 'Roulette', id: `${type}-winners` }
      ],
    }),

    // Historial de ruletas: mesas cerradas con ganadores
    getWinners: builder.query<
      { mesas: Array<{ mesaId: string; type: '150' | '300'; closedAt: string; winners: Array<{ username: string; sectorIndex: number; bet: string | number; payout: string | number }>; houseEarnings: number }> },
      { type: '150' | '300'; limit?: number }
    >({
      query: ({ type, limit = 10 }) => `${API_CONFIG.ENDPOINTS.RULETA}/${type}/winners?limit=${limit}`,
      providesTags: (result, error, { type }) => [
        { type: 'RouletteMesa', id: `${type}-winners` },
        { type: 'Roulette', id: type },
      ],
    }),

    // Reporte de ruletas: totales por rango
    getRouletteReport: builder.query<
      { type: '150' | '300'; dateFrom: string; dateTo: string; totalHouse: number; mesas: number },
      { type: '150' | '300'; dateFrom?: string; dateTo?: string }
    >({
      query: ({ type, dateFrom, dateTo }) => {
        const qs = new URLSearchParams();
        if (dateFrom) qs.set('dateFrom', dateFrom);
        if (dateTo) qs.set('dateTo', dateTo);
        const q = qs.toString();
        return `${API_CONFIG.ENDPOINTS.RULETA}/${type}/report${q ? `?${q}` : ''}`;
      },
      providesTags: (result, error, { type }) => [
        { type: 'Roulette', id: `${type}-report` },
      ],
    }),

    // Obtener total de ganancias de la casa (todas las mesas cerradas)
    getTotalHouseEarnings: builder.query<{
      150: number;
      300: number;
      total: number;
    }, void>({
      query: () => `${API_CONFIG.ENDPOINTS.RULETA}/total-house-earnings`,
      providesTags: [{ type: 'Roulette', id: 'total-house-earnings' }],
    }),
  }),
});

// Exportar hooks generados
export const {
  useGetCurrentMesaQuery,
  usePlaceBetMutation,
  useSubmitSpinResultMutation,
  useSpinMesaMutation,
  useAdvanceMesaMutation,
  useGetHouseReportQuery,
  useGetLastWinnersQuery,
  useGetWinnersQuery,
  useGetRouletteReportQuery,
  useGetTotalHouseEarningsQuery,
} = rouletteApi;
