import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service.js';
import { sendSuccess, sendPaginated, sendNoContent } from '../utils/response.js';
import type { UpdateUserInput, ListUsersQuery } from '../schemas/user.schema.js';

/**
 * GET /api/v1/users
 * Get all users with pagination
 */
export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = req.query as unknown as ListUsersQuery;
    const result = await userService.getUsers(query);

    sendPaginated(
      res,
      result.data,
      result.total,
      result.page,
      result.limit,
      'Users retrieved successfully'
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
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = await userService.getUserById(id);

    sendSuccess(res, user, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/users/:id
 * Update user
 */
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const data = req.body as UpdateUserInput;
    const user = await userService.updateUser(id, data);

    sendSuccess(res, user, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/users/:id
 * Delete user (soft delete)
 */
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    await userService.deleteUser(id);

    sendNoContent(res);
  } catch (error) {
    next(error);
  }
};
