import { z } from 'zod';

export const UserSchema = z.object({
  id: z.number().int().positive(),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  passwordHash: z.string().min(6),
  fullName: z.string().min(2).max(120),
  phone: z.string().min(7).max(20).nullable().optional(),
  balance: z.string().regex(/^\d+\.\d{2}$/),
  wins: z.number().int().min(0),
  losses: z.number().int().min(0),
  role: z.enum(['user', 'admin']),
  lastLogin: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UpdateUserSchema = UserSchema.partial().extend({
  id: z.number().int().positive(),
});

export type UserInput = z.infer<typeof UserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;