import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '@/lib/api/config';

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

    // Girar la ruleta
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
  }),
});

// Exportar hooks generados
export const {
  useGetCurrentMesaQuery,
  usePlaceBetMutation,
  useSpinMesaMutation,
  useAdvanceMesaMutation,
  useGetHouseReportQuery,
  useGetLastWinnersQuery,
} = rouletteApi;
