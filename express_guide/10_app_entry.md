# 🚀 App Factory & Entry Point

## src/app.ts

```typescript
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

import { config } from "./config/index.js";
import { morganStream, logger } from "./utils/logger.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import { generalLimiter } from "./middleware/rateLimiter.middleware.js";
import routes from "./routes/index.js";

/**
 * Create and configure Express application
 */
export const createApp = (): Express => {
    const app = express();

    // ==========================================================================
    // Security Middleware
    // ==========================================================================

    // Set security HTTP headers
    app.use(
        helmet({
            contentSecurityPolicy: config.isProduction ? undefined : false,
        })
    );

    // Enable CORS
    app.use(
        cors({
            origin: config.cors.origins,
            credentials: true,
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization"],
        })
    );

    // ==========================================================================
    // Parsing & Compression Middleware
    // ==========================================================================

    // Parse JSON bodies
    app.use(express.json({ limit: "10kb" }));

    // Parse URL-encoded bodies
    app.use(express.urlencoded({ extended: true, limit: "10kb" }));

    // Compress responses
    app.use(compression());

    // ==========================================================================
    // Logging Middleware
    // ==========================================================================

    // HTTP request logging
    const morganFormat = config.isDevelopment ? "dev" : "combined";
    app.use(morgan(morganFormat, { stream: morganStream }));

    // ==========================================================================
    // Rate Limiting
    // ==========================================================================

    // Apply general rate limit to all requests
    app.use(generalLimiter);

    // ==========================================================================
    // API Documentation (Swagger)
    // ==========================================================================

    if (config.isDevelopment) {
        const swaggerOptions: swaggerJsdoc.Options = {
            definition: {
                openapi: "3.0.0",
                info: {
                    title: "Express TypeScript API",
                    version: "1.0.0",
                    description: "Production-ready Express TypeScript REST API",
                },
                servers: [
                    {
                        url: `http://localhost:${config.port}/api`,
                        description: "Development server",
                    },
                ],
                components: {
                    securitySchemes: {
                        bearerAuth: {
                            type: "http",
                            scheme: "bearer",
                            bearerFormat: "JWT",
                        },
                    },
                },
            },
            apis: ["./src/routes/**/*.ts"],
        };

        const swaggerSpec = swaggerJsdoc(swaggerOptions);
        app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

        logger.info(`📚 Swagger docs available at http://localhost:${config.port}/api-docs`);
    }

    // ==========================================================================
    // API Routes
    // ==========================================================================

    app.use("/api", routes);

    // Root endpoint
    app.get("/", (_req: Request, res: Response) => {
        res.json({
            message: "Express TypeScript API",
            version: "1.0.0",
            docs: config.isDevelopment ? "/api-docs" : undefined,
        });
    });

    // ==========================================================================
    // Error Handling
    // ==========================================================================

    // 404 handler (after all routes)
    app.use(notFoundHandler);

    // Global error handler (must be last)
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        errorHandler(err, req, res, next);
    });

    return app;
};
```

---

## src/index.ts

```typescript
import { createApp } from "./app.js";
import { config } from "./config/index.js";
import { logger } from "./utils/logger.js";
import { prisma } from "./db/prisma.js";

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
    try {
        // Test database connection
        await prisma.$connect();
        logger.info("✅ Database connected successfully");

        // Create Express app
        const app = createApp();

        // Start listening
        const server = app.listen(config.port, config.host, () => {
            logger.info(`🚀 Server running on http://${config.host}:${config.port}`);
            logger.info(`📍 Environment: ${config.env}`);

            if (config.isDevelopment) {
                logger.info(`📚 API Docs: http://localhost:${config.port}/api-docs`);
            }
        });

        // Graceful shutdown
        const gracefulShutdown = async (signal: string): Promise<void> => {
            logger.info(`\n${signal} received. Starting graceful shutdown...`);

            server.close(async () => {
                logger.info("✅ HTTP server closed");

                try {
                    await prisma.$disconnect();
                    logger.info("✅ Database connection closed");
                    process.exit(0);
                } catch (error) {
                    logger.error("❌ Error during shutdown:", error);
                    process.exit(1);
                }
            });

            // Force shutdown after 30 seconds
            setTimeout(() => {
                logger.error("❌ Forced shutdown after timeout");
                process.exit(1);
            }, 30000);
        };

        process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
        process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    } catch (error) {
        logger.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

// Start the server
startServer();
```

---

## src/types/express.d.ts

```typescript
import { Role } from "@prisma/client";

/**
 * Extend Express Request to include user property
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

export {};
```

---

## src/types/index.ts

```typescript
// Re-export all types
export * from "./express.js";

// Common utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// API response types
export interface ApiResponse<T = unknown> {
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

// Pagination params
export interface PaginationParams {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
}
```
