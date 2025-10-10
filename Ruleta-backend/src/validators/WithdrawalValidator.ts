import { z } from 'zod';

export const WithdrawalSchema = z.object({
  id: z.number().int().positive(),
  username: z.string().min(3).max(50),
  cedula: z.string().min(6).max(20),
  telefono: z.string().min(10).max(20),
  banco: z.string().min(3).max(10),
  monto: z.number().positive(),
  status: z.enum(['pending', 'approved', 'rejected', 'completed']),
  processedAt: z.date().nullable().optional(),
  processedBy: z.string().min(1).nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateWithdrawalSchema = WithdrawalSchema.omit({
  id: true,
  status: true,
  processedAt: true,
  processedBy: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  monto: z.number().positive().min(150),
});

export const UpdateWithdrawalStatusSchema = z.object({
  status: z.enum(['approved', 'rejected', 'completed']),
  processedBy: z.string().min(1),
  notes: z.string().nullable().optional(),
});

export type WithdrawalInput = z.infer<typeof WithdrawalSchema>;
export type CreateWithdrawalInput = z.infer<typeof CreateWithdrawalSchema>;
export type UpdateWithdrawalStatusInput = z.infer<typeof UpdateWithdrawalStatusSchema>;

