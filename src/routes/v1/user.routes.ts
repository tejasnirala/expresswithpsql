import { Router, IRouter } from 'express';
import * as userController from '../../controllers/user.controller.js';
import { validate, validateMultiple } from '../../middleware/validate.middleware.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { uuidParamSchema } from '../../schemas/common.schema.js';
import { updateUserSchema, listUsersQuerySchema } from '../../schemas/user.schema.js';
import { Role } from '@prisma/client';

const router: IRouter = Router();

// All user routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/users
 * Get all users (admin only)
 */
router.get(
  '/',
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  validate(listUsersQuerySchema, 'query'),
  userController.getUsers
);

/**
 * GET /api/v1/users/:id
 * Get user by ID
 */
router.get('/:id', validate(uuidParamSchema, 'params'), userController.getUserById);

/**
 * PATCH /api/v1/users/:id
 * Update user
 */
router.patch(
  '/:id',
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
  '/:id',
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  validate(uuidParamSchema, 'params'),
  userController.deleteUser
);

export default router;
