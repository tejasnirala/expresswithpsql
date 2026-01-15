import { z } from 'zod';
import { emailSchema, usernameSchema, paginationSchema } from './common.schema.js';
import { Role } from '@prisma/client';

/**
 * Update user schema (partial - all fields optional)
 */
export const updateUserSchema = z.object({
  email: emailSchema.optional(),
  username: usernameSchema.optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  isActive: z.boolean().optional(),
});

/**
 * Admin update user schema (includes role)
 */
export const adminUpdateUserSchema = updateUserSchema.extend({
  role: z.nativeEnum(Role).optional(),
  isVerified: z.boolean().optional(),
});

/**
 * List users query schema
 */
export const listUsersQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
});

// Type exports
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
