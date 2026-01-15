import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { prisma } from '../db/prisma.js';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';
import { Role } from '@prisma/client';

/**
 * JWT payload structure
 */
interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: Role;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

/**
 * User object attached to request
 */
interface RequestUser {
  id: string;
  email: string;
  role: Role;
}

/**
 * Extended request with user
 */
interface AuthenticatedRequest extends Request {
  user?: RequestUser;
}

/**
 * Extract token from Authorization header
 */
const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
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
      throw new AuthenticationError('No token provided');
    }

    // Verify token
    const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;

    // Validate it's an access token
    if (payload.type !== 'access') {
      throw new AuthenticationError('Invalid token type');
    }

    // Verify user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new AuthenticationError('User not found or inactive');
    }

    // Attach user to request
    (req as AuthenticatedRequest).user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Invalid token'));
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError('Token expired'));
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
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      next(new AuthenticationError('User not authenticated'));
      return;
    }

    if (!allowedRoles.includes(authReq.user.role)) {
      next(new AuthorizationError('Insufficient permissions'));
      return;
    }

    next();
  };
};

// Export the type for use in other files
export type { AuthenticatedRequest, RequestUser };
