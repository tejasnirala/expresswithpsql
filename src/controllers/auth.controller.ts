import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import type {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  LogoutInput,
} from '../schemas/auth.schema.js';

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

    sendCreated(res, result, 'User registered successfully');
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

    sendSuccess(res, result, 'Login successful');
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

    sendSuccess(res, tokens, 'Token refreshed successfully');
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
    const authReq = req as AuthenticatedRequest;

    // req.user is set by authenticate middleware
    if (!authReq.user) {
      sendNoContent(res);
      return;
    }

    await authService.logout(authReq.user.id, req.body.refreshToken);

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
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      throw new Error('User not found in request');
    }

    const user = await authService.getCurrentUser(authReq.user.id);

    sendSuccess(res, user, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
};
