import { z } from 'zod';

export const CreateUsdtRateSchema = z.object({
  rate: z.number().positive().max(1000, 'Tasa muy alta'),
  source: z.enum(['binance', 'coingecko', 'manual']),
});

export type CreateUsdtRateInput = z.infer<typeof CreateUsdtRateSchema>;

export const UpdateUsdtRateSchema = z.object({
  rate: z.number().positive().max(1000, 'Tasa muy alta').optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export type UpdateUsdtRateInput = z.infer<typeof UpdateUsdtRateSchema>;

export const UsdtRateQuerySchema = z.object({
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 50),
  offset: z.string().optional().transform(val => val ? parseInt(val, 10) : 0),
  source: z.enum(['binance', 'coingecko', 'manual']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export type UsdtRateQueryInput = z.infer<typeof UsdtRateQuerySchema>;
