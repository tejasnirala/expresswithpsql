# 🛡️ Middleware

## src/middleware/error.middleware.ts

```typescript
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError, ValidationError } from "../utils/errors.js";
import { sendError } from "../utils/response.js";
import { logger } from "../utils/logger.js";
import { config } from "../config/index.js";

/**
 * Format Zod validation errors
 */
const formatZodErrors = (error: ZodError): Record<string, string[]> => {
    const errors: Record<string, string[]> = {};
    error.errors.forEach((err) => {
        const path = err.path.join(".");
        if (!errors[path]) {
            errors[path] = [];
        }
        errors[path].push(err.message);
    });
    return errors;
};

/**
 * Global error handler middleware
 * Must be registered LAST in middleware chain
 */
export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
): Response => {
    // Log error
    logger.error("Error caught by handler:", {
        name: err.name,
        message: err.message,
        stack: config.isDevelopment ? err.stack : undefined,
        path: req.path,
        method: req.method,
    });

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        return sendError(res, "Validation failed", 400, formatZodErrors(err));
    }

    // Handle custom validation errors
    if (err instanceof ValidationError) {
        return sendError(res, err.message, err.statusCode, err.errors);
    }

    // Handle custom application errors
    if (err instanceof AppError) {
        return sendError(res, err.message, err.statusCode);
    }

    // Handle Prisma errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case "P2002": // Unique constraint violation
                return sendError(res, "A record with this value already exists", 409);
            case "P2025": // Record not found
                return sendError(res, "Record not found", 404);
            case "P2003": // Foreign key constraint violation
                return sendError(res, "Related record not found", 400);
            default:
                return sendError(res, "Database error", 500);
        }
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
        return sendError(res, "Invalid data provided", 400);
    }

    // Handle JWT errors
    if (err.name === "JsonWebTokenError") {
        return sendError(res, "Invalid token", 401);
    }

    if (err.name === "TokenExpiredError") {
        return sendError(res, "Token expired", 401);
    }

    // Default to 500 internal server error
    const message = config.isProduction ? "Internal server error" : err.message;
    return sendError(res, message, 500);
};

/**
 * 404 Not Found handler
 * Register AFTER all routes
 */
export const notFoundHandler = (req: Request, res: Response): Response => {
    return sendError(res, `Route ${req.method} ${req.path} not found`, 404);
};
```

---

## src/middleware/validate.middleware.ts

```typescript
import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { sendError } from "../utils/response.js";

/**
 * Location of data to validate
 */
type ValidationSource = "body" | "query" | "params";

/**
 * Validation middleware factory
 *
 * @example
 * router.post('/users', validate(createUserSchema, 'body'), createUser);
 * router.get('/users/:id', validate(userIdSchema, 'params'), getUser);
 */
export const validate = (schema: ZodSchema, source: ValidationSource = "body") => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = req[source];
            const validated = await schema.parseAsync(data);

            // Replace with validated/transformed data
            req[source] = validated;

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors: Record<string, string[]> = {};
                error.errors.forEach((err) => {
                    const path = err.path.join(".") || source;
                    if (!errors[path]) {
                        errors[path] = [];
                    }
                    errors[path].push(err.message);
                });

                sendError(res, "Validation failed", 400, errors);
                return;
            }
            next(error);
        }
    };
};

/**
 * Validate multiple sources at once
 *
 * @example
 * router.patch('/users/:id',
 *   validateMultiple({ params: userIdSchema, body: updateUserSchema }),
 *   updateUser
 * );
 */
export const validateMultiple = (schemas: Partial<Record<ValidationSource, ZodSchema>>) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            for (const [source, schema] of Object.entries(schemas)) {
                if (schema) {
                    const data = req[source as ValidationSource];
                    const validated = await schema.parseAsync(data);
                    req[source as ValidationSource] = validated;
                }
            }
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors: Record<string, string[]> = {};
                error.errors.forEach((err) => {
                    const path = err.path.join(".") || "unknown";
                    if (!errors[path]) {
                        errors[path] = [];
                    }
                    errors[path].push(err.message);
                });

                sendError(res, "Validation failed", 400, errors);
                return;
            }
            next(error);
        }
    };
};
```

---

## src/middleware/auth.middleware.ts

```typescript
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { prisma } from "../db/prisma.js";
import { AuthenticationError, AuthorizationError } from "../utils/errors.js";
import { Role } from "@prisma/client";

/**
 * JWT payload structure
 */
interface JwtPayload {
    sub: string; // User ID
    email: string;
    role: Role;
    type: "access" | "refresh";
    iat: number;
    exp: number;
}

/**
 * Augment Express Request with user
 */
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: Role;
            };
        }
    }
}

/**
 * Extract token from Authorization header
 */
const extractToken = (req: Request): string | null => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.substring(7);
    }
    return null;
};

/**
 * Authenticate JWT token
 * Required for protected routes
 */
export const authenticate = async (
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const token = extractToken(req);

        if (!token) {
            throw new AuthenticationError("No token provided");
        }

        // Verify token
        const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;

        // Validate it's an access token
        if (payload.type !== "access") {
            throw new AuthenticationError("Invalid token type");
        }

        // Verify user exists and is active
        const user = await prisma.user.findUnique({
            where: { id: payload.sub },
            select: { id: true, email: true, role: true, isActive: true },
        });

        if (!user || !user.isActive) {
            throw new AuthenticationError("User not found or inactive");
        }

        // Attach user to request
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
        };

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new AuthenticationError("Invalid token"));
            return;
        }
        if (error instanceof jwt.TokenExpiredError) {
            next(new AuthenticationError("Token expired"));
            return;
        }
        next(error);
    }
};

/**
 * Authorize based on roles
 * Must be used AFTER authenticate middleware
 *
 * @example
 * router.delete('/users/:id', authenticate, authorize(['ADMIN']), deleteUser);
 */
export const authorize = (allowedRoles: Role[]) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        if (!req.user) {
            next(new AuthenticationError("User not authenticated"));
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            next(new AuthorizationError("Insufficient permissions"));
            return;
        }

        next();
    };
};
```

---

## src/middleware/rateLimiter.middleware.ts

```typescript
import rateLimit from "express-rate-limit";
import { config } from "../config/index.js";
import { sendError } from "../utils/response.js";

/**
 * General rate limiter for all routes
 */
export const generalLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        sendError(res, "Too many requests, please try again later", 429);
    },
});

/**
 * Strict rate limiter for authentication routes
 */
export const authLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.authMaxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    handler: (_req, res) => {
        sendError(res, "Too many authentication attempts, please try again later", 429);
    },
});
```
