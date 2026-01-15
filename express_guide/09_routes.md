# 🛤️ Routes

## src/routes/v1/health.routes.ts

```typescript
import { Router, Request, Response } from "express";
import { sendSuccess } from "../../utils/response.js";
import { prisma } from "../../db/prisma.js";
import { config } from "../../config/index.js";

const router = Router();

/**
 * GET /api/v1/health
 * Basic health check
 */
router.get("/", (_req: Request, res: Response) => {
    sendSuccess(
        res,
        {
            status: "healthy",
            timestamp: new Date().toISOString(),
            environment: config.env,
        },
        "Service is healthy"
    );
});

/**
 * GET /api/v1/health/ready
 * Readiness check (includes database)
 */
router.get("/ready", async (_req: Request, res: Response) => {
    try {
        // Check database connection
        await prisma.$queryRaw`SELECT 1`;

        sendSuccess(
            res,
            {
                status: "ready",
                timestamp: new Date().toISOString(),
                database: "connected",
            },
            "Service is ready"
        );
    } catch {
        res.status(503).json({
            success: false,
            message: "Service not ready",
            data: {
                status: "not_ready",
                timestamp: new Date().toISOString(),
                database: "disconnected",
            },
        });
    }
});

export default router;
```

---

## src/routes/v1/auth.routes.ts

```typescript
import { Router } from "express";
import * as authController from "../../controllers/auth.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authLimiter } from "../../middleware/rateLimiter.middleware.js";
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    logoutSchema,
} from "../../schemas/auth.schema.js";

const router = Router();

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post("/register", authLimiter, validate(registerSchema), authController.register);

/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post("/login", authLimiter, validate(loginSchema), authController.login);

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
router.post("/refresh", authLimiter, validate(refreshTokenSchema), authController.refresh);

/**
 * POST /api/v1/auth/logout
 * Logout user
 */
router.post("/logout", authenticate, validate(logoutSchema), authController.logout);

/**
 * GET /api/v1/auth/me
 * Get current user
 */
router.get("/me", authenticate, authController.me);

export default router;
```

---

## src/routes/v1/user.routes.ts

```typescript
import { Router } from "express";
import * as userController from "../../controllers/user.controller.js";
import { validate, validateMultiple } from "../../middleware/validate.middleware.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { uuidParamSchema } from "../../schemas/common.schema.js";
import { updateUserSchema, listUsersQuerySchema } from "../../schemas/user.schema.js";
import { Role } from "@prisma/client";

const router = Router();

// All user routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/users
 * Get all users (admin only)
 */
router.get(
    "/",
    authorize([Role.ADMIN, Role.SUPER_ADMIN]),
    validate(listUsersQuerySchema, "query"),
    userController.getUsers
);

/**
 * GET /api/v1/users/:id
 * Get user by ID
 */
router.get("/:id", validate(uuidParamSchema, "params"), userController.getUserById);

/**
 * PATCH /api/v1/users/:id
 * Update user
 */
router.patch(
    "/:id",
    validateMultiple({
        params: uuidParamSchema,
        body: updateUserSchema,
    }),
    userController.updateUser
);

/**
 * DELETE /api/v1/users/:id
 * Delete user (admin only)
 */
router.delete(
    "/:id",
    authorize([Role.ADMIN, Role.SUPER_ADMIN]),
    validate(uuidParamSchema, "params"),
    userController.deleteUser
);

export default router;
```

---

## src/routes/v1/index.ts

```typescript
import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

// Mount v1 routes
router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

export default router;
```

---

## src/routes/index.ts

```typescript
import { Router } from "express";
import v1Routes from "./v1/index.js";

const router = Router();

// API versioning
router.use("/v1", v1Routes);

// Default redirect to v1
router.use("/", v1Routes);

export default router;
```
