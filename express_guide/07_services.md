# 🧠 Services (Business Logic)

## src/services/auth.service.ts

```typescript
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { config } from "../config/index.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { AuthenticationError, ConflictError, NotFoundError } from "../utils/errors.js";
import type { RegisterInput, LoginInput } from "../schemas/auth.schema.js";

/**
 * JWT payload interface
 */
interface TokenPayload {
    sub: string;
    email: string;
    role: Role;
    type: "access" | "refresh";
}

/**
 * Token pair returned after login/register
 */
interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

/**
 * User data returned to client (no sensitive data)
 */
interface SafeUser {
    id: string;
    email: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    role: Role;
    isActive: boolean;
    isVerified: boolean;
    createdAt: Date;
}

/**
 * Generate JWT tokens
 */
const generateTokens = async (user: {
    id: string;
    email: string;
    role: Role;
}): Promise<TokenPair> => {
    const accessPayload: TokenPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        type: "access",
    };

    const refreshPayload: TokenPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        type: "refresh",
    };

    const accessToken = jwt.sign(accessPayload, config.jwt.secret, {
        expiresIn: config.jwt.accessTokenExpiresIn,
    });

    const refreshToken = jwt.sign(refreshPayload, config.jwt.secret, {
        expiresIn: config.jwt.refreshTokenExpiresIn,
    });

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt,
        },
    });

    return { accessToken, refreshToken };
};

/**
 * Exclude sensitive fields from user
 */
const toSafeUser = (user: {
    id: string;
    email: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    role: Role;
    isActive: boolean;
    isVerified: boolean;
    createdAt: Date;
}): SafeUser => ({
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
});

/**
 * Register a new user
 */
export const register = async (
    data: RegisterInput
): Promise<{ user: SafeUser; tokens: TokenPair }> => {
    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
        where: { email: data.email },
    });
    if (existingEmail) {
        throw new ConflictError("Email already registered");
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
        where: { username: data.username },
    });
    if (existingUsername) {
        throw new ConflictError("Username already taken");
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
        data: {
            email: data.email,
            username: data.username,
            passwordHash,
            firstName: data.firstName,
            lastName: data.lastName,
        },
    });

    // Generate tokens
    const tokens = await generateTokens(user);

    return { user: toSafeUser(user), tokens };
};

/**
 * Login user
 */
export const login = async (data: LoginInput): Promise<{ user: SafeUser; tokens: TokenPair }> => {
    // Find user by email
    const user = await prisma.user.findUnique({
        where: { email: data.email },
    });

    // Generic error to prevent email enumeration
    if (!user) {
        throw new AuthenticationError("Invalid email or password");
    }

    // Check if user is active
    if (!user.isActive) {
        throw new AuthenticationError("Account is disabled");
    }

    // Verify password
    const isValidPassword = await verifyPassword(data.password, user.passwordHash);
    if (!isValidPassword) {
        throw new AuthenticationError("Invalid email or password");
    }

    // Update last login
    await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = await generateTokens(user);

    return { user: toSafeUser(user), tokens };
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<TokenPair> => {
    // Verify refresh token
    let payload: TokenPayload;
    try {
        payload = jwt.verify(refreshToken, config.jwt.secret) as TokenPayload;
    } catch {
        throw new AuthenticationError("Invalid refresh token");
    }

    if (payload.type !== "refresh") {
        throw new AuthenticationError("Invalid token type");
    }

    // Check if token exists and is not revoked
    const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
    });

    if (!storedToken || storedToken.isRevoked) {
        throw new AuthenticationError("Token has been revoked");
    }

    if (storedToken.expiresAt < new Date()) {
        throw new AuthenticationError("Token has expired");
    }

    // Revoke old refresh token (token rotation)
    await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true },
    });

    // Generate new tokens
    const tokens = await generateTokens(storedToken.user);

    return tokens;
};

/**
 * Logout user (revoke refresh token)
 */
export const logout = async (userId: string, refreshToken?: string): Promise<void> => {
    if (refreshToken) {
        // Revoke specific token
        await prisma.refreshToken.updateMany({
            where: { token: refreshToken, userId },
            data: { isRevoked: true },
        });
    } else {
        // Revoke all tokens for user
        await prisma.refreshToken.updateMany({
            where: { userId },
            data: { isRevoked: true },
        });
    }
};

/**
 * Get current user by ID
 */
export const getCurrentUser = async (userId: string): Promise<SafeUser> => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new NotFoundError("User");
    }

    return toSafeUser(user);
};
```

---

## src/services/user.service.ts

```typescript
import { Role, Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { NotFoundError, ConflictError } from "../utils/errors.js";
import type { UpdateUserInput, ListUsersQuery } from "../schemas/user.schema.js";

/**
 * Safe user type (no password)
 */
interface SafeUser {
    id: string;
    email: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    role: Role;
    isActive: boolean;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Paginated result
 */
interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

/**
 * Fields to select (exclude password)
 */
const safeUserSelect = {
    id: true,
    email: true,
    username: true,
    firstName: true,
    lastName: true,
    role: true,
    isActive: true,
    isVerified: true,
    createdAt: true,
    updatedAt: true,
} as const;

/**
 * Get all users with pagination and filtering
 */
export const getUsers = async (query: ListUsersQuery): Promise<PaginatedResult<SafeUser>> => {
    const { page, limit, sortBy, sortOrder, search, role, isActive } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.UserWhereInput = {};

    if (search) {
        where.OR = [
            { email: { contains: search, mode: "insensitive" } },
            { username: { contains: search, mode: "insensitive" } },
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
        ];
    }

    if (role) {
        where.role = role;
    }

    if (isActive !== undefined) {
        where.isActive = isActive;
    }

    // Execute query with count
    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: safeUserSelect,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
        }),
        prisma.user.count({ where }),
    ]);

    return { data: users, total, page, limit };
};

/**
 * Get user by ID
 */
export const getUserById = async (id: string): Promise<SafeUser> => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: safeUserSelect,
    });

    if (!user) {
        throw new NotFoundError("User");
    }

    return user;
};

/**
 * Update user
 */
export const updateUser = async (id: string, data: UpdateUserInput): Promise<SafeUser> => {
    // Check user exists
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
        throw new NotFoundError("User");
    }

    // Check email uniqueness if being updated
    if (data.email && data.email !== existing.email) {
        const emailExists = await prisma.user.findUnique({
            where: { email: data.email },
        });
        if (emailExists) {
            throw new ConflictError("Email already in use");
        }
    }

    // Check username uniqueness if being updated
    if (data.username && data.username !== existing.username) {
        const usernameExists = await prisma.user.findUnique({
            where: { username: data.username },
        });
        if (usernameExists) {
            throw new ConflictError("Username already in use");
        }
    }

    const user = await prisma.user.update({
        where: { id },
        data,
        select: safeUserSelect,
    });

    return user;
};

/**
 * Delete user (soft delete by setting isActive = false)
 */
export const deleteUser = async (id: string): Promise<void> => {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
        throw new NotFoundError("User");
    }

    await prisma.user.update({
        where: { id },
        data: { isActive: false },
    });
};

/**
 * Hard delete user (permanent)
 */
export const hardDeleteUser = async (id: string): Promise<void> => {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
        throw new NotFoundError("User");
    }

    await prisma.user.delete({ where: { id } });
};
```
