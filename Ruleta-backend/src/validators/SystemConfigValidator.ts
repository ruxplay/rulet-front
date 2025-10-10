import { z } from 'zod';

export const CreateSystemConfigSchema = z.object({
  key: z.string().min(1).max(100).regex(/^[a-z_]+$/, 'Key must be lowercase with underscores only'),
  value: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1).max(50),
  dataType: z.enum(['string', 'number', 'boolean', 'json']),
  isEditable: z.boolean().default(true),
  validationRules: z.string().optional(),
});

export type CreateSystemConfigInput = z.infer<typeof CreateSystemConfigSchema>;

export const UpdateSystemConfigSchema = z.object({
  value: z.string().min(1),
  description: z.string().optional(),
  validationRules: z.string().optional(),
});

export type UpdateSystemConfigInput = z.infer<typeof UpdateSystemConfigSchema>;

export const SystemConfigQuerySchema = z.object({
  category: z.string().optional(),
  isEditable: z.string().optional().transform(val => val === 'true'),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 50),
  offset: z.string().optional().transform(val => val ? parseInt(val, 10) : 0),
});

export type SystemConfigQueryInput = z.infer<typeof SystemConfigQuerySchema>;

export const BulkUpdateSystemConfigSchema = z.object({
  configs: z.array(z.object({
    key: z.string(),
    value: z.string(),
  })).min(1),
});

export type BulkUpdateSystemConfigInput = z.infer<typeof BulkUpdateSystemConfigSchema>;

