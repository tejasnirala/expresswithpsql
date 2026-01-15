# 🎮 Controllers (Request Handlers)

## src/controllers/auth.controller.ts

```typescript
import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service.js";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/response.js";
import type {
    RegisterInput,
    LoginInput,
    RefreshTokenInput,
    LogoutInput,
} from "../schemas/auth.schema.js";

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
export const register = async (
    req: Request<unknown, unknown, RegisterInput>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const result = await authService.register(req.body);

        sendCreated(res, result, "User registered successfully");
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/auth/login
 * Login user and return tokens
 */
export const login = async (
    req: Request<unknown, unknown, LoginInput>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const result = await authService.login(req.body);

        sendSuccess(res, result, "Login successful");
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/auth/refresh
 * Refresh access token using refresh token
 */
export const refresh = async (
    req: Request<unknown, unknown, RefreshTokenInput>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const tokens = await authService.refreshAccessToken(req.body.refreshToken);

        sendSuccess(res, tokens, "Token refreshed successfully");
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/auth/logout
 * Logout user (revoke tokens)
 */
export const logout = async (
    req: Request<unknown, unknown, LogoutInput>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // req.user is set by authenticate middleware
        if (!req.user) {
            sendNoContent(res);
            return;
        }

        await authService.logout(req.user.id, req.body.refreshToken);

        sendNoContent(res);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/auth/me
 * Get current authenticated user
 */
export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            throw new Error("User not found in request");
        }

        const user = await authService.getCurrentUser(req.user.id);

        sendSuccess(res, user, "User retrieved successfully");
    } catch (error) {
        next(error);
    }
};
```

---

## src/controllers/user.controller.ts

```typescript
import { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service.js";
import { sendSuccess, sendPaginated, sendNoContent } from "../utils/response.js";
import type { UuidParam } from "../schemas/common.schema.js";
import type { UpdateUserInput, ListUsersQuery } from "../schemas/user.schema.js";

/**
 * GET /api/v1/users
 * Get all users with pagination
 */
export const getUsers = async (
    req: Request<unknown, unknown, unknown, ListUsersQuery>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const result = await userService.getUsers(req.query);

        sendPaginated(
            res,
            result.data,
            result.total,
            result.page,
            result.limit,
            "Users retrieved successfully"
        );
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/users/:id
 * Get user by ID
 */
export const getUserById = async (
    req: Request<UuidParam>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = await userService.getUserById(req.params.id);

        sendSuccess(res, user, "User retrieved successfully");
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/v1/users/:id
 * Update user
 */
export const updateUser = async (
    req: Request<UuidParam, unknown, UpdateUserInput>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = await userService.updateUser(req.params.id, req.body);

        sendSuccess(res, user, "User updated successfully");
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/v1/users/:id
 * Delete user (soft delete)
 */
export const deleteUser = async (
    req: Request<UuidParam>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        await userService.deleteUser(req.params.id);

        sendNoContent(res);
    } catch (error) {
        next(error);
    }
};
```
