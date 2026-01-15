# 🛠️ Core Utilities

## src/utils/logger.ts

```typescript
import winston from "winston";
import path from "path";
import { config } from "../config/index.js";

// Define log levels with colors
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const colors = {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "cyan",
};

winston.addColors(colors);

// Custom format for console output
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.colorize({ all: false, level: true }),
    winston.format.printf(({ timestamp, level, message, ...metadata }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(metadata).length > 0) {
            msg += ` ${JSON.stringify(metadata)}`;
        }
        return msg;
    })
);

// JSON format for file/production
const jsonFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Create transports array
const transports: winston.transport[] = [
    new winston.transports.Console({
        format: consoleFormat,
    }),
];

// Add file transports in production
if (config.isProduction) {
    const logDir = path.resolve(process.cwd(), "logs");

    transports.push(
        new winston.transports.File({
            filename: path.join(logDir, "error.log"),
            level: "error",
            format: jsonFormat,
        }),
        new winston.transports.File({
            filename: path.join(logDir, "combined.log"),
            format: jsonFormat,
        })
    );
}

export const logger = winston.createLogger({
    level: config.log.level,
    levels,
    transports,
});

// Stream for morgan integration
export const morganStream = {
    write: (message: string): void => {
        logger.http(message.trim());
    },
};
```

---

## src/utils/errors.ts

```typescript
/**
 * Base application error class
 * All custom errors should extend this
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly code: string;

    constructor(
        message: string,
        statusCode: number = 500,
        code: string = "INTERNAL_ERROR",
        isOperational: boolean = true
    ) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;

        // Maintains proper stack trace
        Error.captureStackTrace(this, this.constructor);

        // Set prototype explicitly for instanceof to work
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

/**
 * 400 - Validation Error
 */
export class ValidationError extends AppError {
    public readonly errors: Record<string, string[]>;

    constructor(message: string = "Validation failed", errors: Record<string, string[]> = {}) {
        super(message, 400, "VALIDATION_ERROR");
        this.errors = errors;
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

/**
 * 401 - Authentication Error
 */
export class AuthenticationError extends AppError {
    constructor(message: string = "Authentication required") {
        super(message, 401, "AUTHENTICATION_ERROR");
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}

/**
 * 403 - Authorization Error
 */
export class AuthorizationError extends AppError {
    constructor(message: string = "Access denied") {
        super(message, 403, "AUTHORIZATION_ERROR");
        Object.setPrototypeOf(this, AuthorizationError.prototype);
    }
}

/**
 * 404 - Not Found Error
 */
export class NotFoundError extends AppError {
    constructor(resource: string = "Resource") {
        super(`${resource} not found`, 404, "NOT_FOUND");
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

/**
 * 409 - Conflict Error
 */
export class ConflictError extends AppError {
    constructor(message: string = "Resource already exists") {
        super(message, 409, "CONFLICT");
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}

/**
 * 429 - Rate Limit Error
 */
export class RateLimitError extends AppError {
    constructor(message: string = "Too many requests") {
        super(message, 429, "RATE_LIMIT_EXCEEDED");
        Object.setPrototypeOf(this, RateLimitError.prototype);
    }
}
```

---

## src/utils/response.ts

```typescript
import { Response } from "express";

/**
 * Standardized API response format
 */
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    errors?: Record<string, string[]>;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}

/**
 * Send success response
 */
export const sendSuccess = <T>(
    res: Response,
    data: T,
    message: string = "Success",
    statusCode: number = 200,
    meta?: ApiResponse<T>["meta"]
): Response => {
    const response: ApiResponse<T> = {
        success: true,
        message,
        data,
    };

    if (meta) {
        response.meta = meta;
    }

    return res.status(statusCode).json(response);
};

/**
 * Send created response (201)
 */
export const sendCreated = <T>(
    res: Response,
    data: T,
    message: string = "Created successfully"
): Response => {
    return sendSuccess(res, data, message, 201);
};

/**
 * Send no content response (204)
 */
export const sendNoContent = (res: Response): Response => {
    return res.status(204).send();
};

/**
 * Send error response
 */
export const sendError = (
    res: Response,
    message: string,
    statusCode: number = 500,
    errors?: Record<string, string[]>
): Response => {
    const response: ApiResponse<null> = {
        success: false,
        message,
    };

    if (errors) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 */
export const sendPaginated = <T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number,
    message: string = "Success"
): Response => {
    return sendSuccess(res, data, message, 200, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    });
};
```

---

## src/utils/password.ts

```typescript
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Verify a password against a hash
 */
export const verifyPassword = async (
    password: string,
    hashedPassword: string
): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};
```
