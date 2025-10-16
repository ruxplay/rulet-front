import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string()
    .min(3, 'Mínimo 3 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .refine((val) => {
      // Permite username simple O email
      const usernamePattern = /^[a-zA-Z0-9_]+$/;
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return usernamePattern.test(val) || emailPattern.test(val);
    }, 'Debe ser un username válido o email'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export const registerSchema = z.object({
  username: z.string()
    .min(3, 'Mínimo 3 caracteres')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y _'),
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(6, 'Mínimo 6 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  fullName: z.string()
    .min(2, 'Mínimo 2 caracteres')
    .max(50, 'Máximo 50 caracteres'),
  phone: z.string()
    .regex(/^[0-9+\-\s()]+$/, 'Teléfono inválido')
    .optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;