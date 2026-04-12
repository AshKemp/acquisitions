import logger from '#config/logger.js';
import { formatValidationError } from '#utils/format.js';
import {
  getAllUsers as getAllUsers,
  getUserById as getUserByIdService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
} from '#services/users.service.js';
import {
  updateUserSchema,
  userIdSchema,
} from '#validations/users.validation.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Fetching all users');
    const allUsers = await getAllUsers();
    res.json({
      message: 'Successfully fetched all users',
      data: allUsers,
      userCount: allUsers.length,
    });
  } catch (error) {
    logger.error('Error fetching users:', error);
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  const validationResult = userIdSchema.safeParse(req.params);
  if (!validationResult.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: formatValidationError(validationResult.error),
    });
  }

  try {
    const { id } = validationResult.data;
    const user = await getUserByIdService(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    logger.info('Fetched user by id', { id });
    res.json({ message: 'Successfully fetched user', data: user });
  } catch (error) {
    logger.error('Error fetching user by id:', error);
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  const paramsResult = userIdSchema.safeParse(req.params);
  const bodyResult = updateUserSchema.safeParse(req.body);

  if (!paramsResult.success || !bodyResult.success) {
    const details = [
      ...(!paramsResult.success
        ? formatValidationError(paramsResult.error)
        : []),
      ...(!bodyResult.success ? formatValidationError(bodyResult.error) : []),
    ];
    return res.status(400).json({
      error: 'Validation failed',
      details,
    });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const { id } = paramsResult.data;
  const updates = bodyResult.data;
  const authUserId = Number(req.user.id);
  const isAdmin = req.user.role === 'admin';

  if (authUserId !== id && !isAdmin) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (!isAdmin && updates.role) {
    return res.status(403).json({ message: 'Only admins can update role' });
  }

  try {
    const updatedUser = await updateUserService(id, updates);
    logger.info('Updated user', { id, updatedBy: authUserId });
    res.json({ message: 'User updated successfully', data: updatedUser });
  } catch (error) {
    logger.error('Error updating user:', error);
    if (error.message === 'User not found') {
      return res.status(404).json({ message: 'User not found' });
    }
    if (error.message === 'User with this email already exists') {
      return res.status(409).json({ message: error.message });
    }
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  const validationResult = userIdSchema.safeParse(req.params);
  if (!validationResult.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: formatValidationError(validationResult.error),
    });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const { id } = validationResult.data;
  const authUserId = Number(req.user.id);
  const isAdmin = req.user.role === 'admin';

  if (authUserId !== id && !isAdmin) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    await deleteUserService(id);
    logger.info('Deleted user', { id, deletedBy: authUserId });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Error deleting user:', error);
    if (error.message === 'User not found') {
      return res.status(404).json({ message: 'User not found' });
    }
    next(error);
  }
};
