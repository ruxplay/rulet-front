import { z } from 'zod';

export const CreateDepositSchema = z.object({
  username: z.string().min(1),
  amount: z.number().finite().gte(50),
  reference: z.string().min(1).max(100),
  bank: z.string().min(1).max(50),
  receiptUrl: z.string().min(1),
  receiptPublicId: z.string().min(1),
  receiptFormat: z.string().min(1),
  receiptBytes: z.number().int().nonnegative(),
  paymentMethod: z.enum(['bank_transfer', 'usdt']).default('bank_transfer'),
  usdtAmount: z.number().positive().optional(),
  exchangeRate: z.number().positive().optional(),
  walletAddress: z.string().optional(),
  transactionHash: z.string().optional(),
}).refine(data => {
  // If payment method is USDT, validate USDT-specific fields
  if (data.paymentMethod === 'usdt') {
    return data.usdtAmount && data.exchangeRate && data.walletAddress;
  }
  return true;
}, {
  message: "Para pagos USDT se requieren: usdtAmount, exchangeRate y walletAddress"
});

export type CreateDepositInput = z.infer<typeof CreateDepositSchema>;

export const UpdateDepositStatusSchema = z.object({
  status: z.enum(['approved', 'rejected', 'completed']),
  processedBy: z.string().optional(),
  notes: z.string().optional(),
});

export type UpdateDepositStatusInput = z.infer<typeof UpdateDepositStatusSchema>;


