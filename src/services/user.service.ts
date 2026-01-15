import { Role, Prisma } from '@prisma/client';
import { prisma } from '../db/prisma.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import type { UpdateUserInput, ListUsersQuery } from '../schemas/user.schema.js';

/**
 * Safe user type (no password)
 */
interface SafeUser {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  role: Role;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Paginated result
 */
interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Fields to select (exclude password)
 */
const safeUserSelect = {
  id: true,
  email: true,
  username: true,
  firstName: true,
  lastName: true,
  role: true,
  isActive: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * Get all users with pagination and filtering
 */
export const getUsers = async (query: ListUsersQuery): Promise<PaginatedResult<SafeUser>> => {
  const { page, limit, sortBy, sortOrder, search, role, isActive } = query;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.UserWhereInput = {};

  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { username: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (role) {
    where.role = role;
  }

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  // Execute query with count
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: safeUserSelect,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.user.count({ where }),
  ]);

  return { data: users, total, page, limit };
};

/**
 * Get user by ID
 */
export const getUserById = async (id: string): Promise<SafeUser> => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: safeUserSelect,
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  return user;
};

/**
 * Update user
 */
export const updateUser = async (id: string, data: UpdateUserInput): Promise<SafeUser> => {
  // Check user exists
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError('User');
  }

  // Check email uniqueness if being updated
  if (data.email && data.email !== existing.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (emailExists) {
      throw new ConflictError('Email already in use');
    }
  }

  // Check username uniqueness if being updated
  if (data.username && data.username !== existing.username) {
    const usernameExists = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (usernameExists) {
      throw new ConflictError('Username already in use');
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: safeUserSelect,
  });

  return user;
};

/**
 * Delete user (soft delete by setting isActive = false)
 */
export const deleteUser = async (id: string): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new NotFoundError('User');
  }

  await prisma.user.update({
    where: { id },
    data: { isActive: false },
  });
};

/**
 * Hard delete user (permanent)
 */
export const hardDeleteUser = async (id: string): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new NotFoundError('User');
  }

  await prisma.user.delete({ where: { id } });
};
