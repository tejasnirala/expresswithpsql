# 📝 Schemas (Zod Validation)

## src/schemas/common.schema.ts

```typescript
import { z } from "zod";

/**
 * UUID parameter schema
 */
export const uuidParamSchema = z.object({
    id: z.string().uuid("Invalid UUID format"),
});

/**
 * Pagination query schema
 */
export const paginationSchema = z.object({
    page: z
        .string()
        .optional()
        .default("1")
        .transform((val) => parseInt(val, 10))
        .refine((val) => val > 0, "Page must be positive"),
    limit: z
        .string()
        .optional()
        .default("10")
        .transform((val) => parseInt(val, 10))
        .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100"),
    sortBy: z.string().optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

/**
 * Email schema
 */
export const emailSchema = z.string().email("Invalid email format").toLowerCase().trim();

/**
 * Password schema with requirements
 */
export const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must not exceed 72 characters") // bcrypt limit
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number");

/**
 * Username schema
 */
export const usernameSchema = z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must not exceed 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .toLowerCase()
    .trim();

// Type exports
export type UuidParam = z.infer<typeof uuidParamSchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;
```

---

## src/schemas/auth.schema.ts

```typescript
import { z } from "zod";
import { emailSchema, passwordSchema, usernameSchema } from "./common.schema.js";

/**
 * Register request schema
 */
export const registerSchema = z.object({
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
});

/**
 * Login request schema
 */
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
});

/**
 * Refresh token request schema
 */
export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
});

/**
 * Logout request schema
 */
export const logoutSchema = z.object({
    refreshToken: z.string().optional(),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
```

---

## src/schemas/user.schema.ts

```typescript
import { z } from "zod";
import { emailSchema, usernameSchema, paginationSchema } from "./common.schema.js";
import { Role } from "@prisma/client";

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
            if (val === "true") return true;
            if (val === "false") return false;
            return undefined;
        }),
});

// Type exports
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
```
