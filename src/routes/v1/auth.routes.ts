import { Router, IRouter } from 'express';
import * as authController from '../../controllers/auth.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authLimiter } from '../../middleware/rateLimiter.middleware.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
} from '../../schemas/auth.schema.js';

const router: IRouter = Router();

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post('/register', authLimiter, validate(registerSchema), authController.register);

/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post('/login', authLimiter, validate(loginSchema), authController.login);

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
router.post('/refresh', authLimiter, validate(refreshTokenSchema), authController.refresh);

/**
 * POST /api/v1/auth/logout
 * Logout user
 */
router.post('/logout', authenticate, validate(logoutSchema), authController.logout);

/**
 * GET /api/v1/auth/me
 * Get current user
 */
router.get('/me', authenticate, authController.me);

export default router;
