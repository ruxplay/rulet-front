// src/validators/AuthValidator.ts
import { z } from 'zod';

export const LoginSchema = z.object({
  username: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
}).refine(data => data.username || data.email, {
  message: "Username o email es requerido"
});

export const RegisterSchema = z.object({
  username: z.string()
    .min(3, "El username debe tener al menos 3 caracteres")
    .max(50, "El username no puede exceder 50 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "El username solo puede contener letras, números y guiones bajos"),
  email: z.string()
    .email("Formato de email inválido")
    .max(120, "El email no puede exceder 120 caracteres"),
  password: z.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100, "La contraseña no puede exceder 100 caracteres"),
  fullName: z.string()
    .min(2, "El nombre completo debe tener al menos 2 caracteres")
    .max(120, "El nombre completo no puede exceder 120 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras y espacios"),
  phone: z.string()
    .regex(/^[0-9+\-\s()]+$/, "Formato de teléfono inválido")
    .optional()
    .nullable()
});

export const UsernamesQuerySchema = z.object({
  email: z.string()
    .email("Formato de email inválido")
    .min(1, "Email requerido")
});

export const PasswordResetSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).optional()
}).refine(data => data.email || data.username, {
  message: "Email o username es requerido"
});

// Tipos TypeScript
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type UsernamesQueryInput = z.infer<typeof UsernamesQuerySchema>;
export type PasswordResetInput = z.infer<typeof PasswordResetSchema>;