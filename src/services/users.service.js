import { db } from '#config/database.js';
import logger from '#config/logger.js';
import { eq } from 'drizzle-orm';
import { users } from '#models/user.model.js';
import { hashPassword } from '#services/auth.service.js';

export const getAllUsers = async () => {
  try {
    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users);
  } catch (error) {
    logger.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserById = async id => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user;
  } catch (error) {
    logger.error('Error fetching user by id:', error);
    throw error;
  }
};

export const updateUser = async (id, updates) => {
  try {
    const [existingUser] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existingUser) {
      throw new Error('User not found');
    }

    const updateData = {};
    if (updates.name) {
      updateData.name = updates.name;
    }
    if (updates.email) {
      updateData.email = updates.email;
    }
    if (updates.password) {
      updateData.password = await hashPassword(updates.password);
    }
    if (updates.role) {
      updateData.role = updates.role;
    }

    if (Object.keys(updateData).length === 0) {
      return existingUser;
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      });

    return updatedUser;
  } catch (error) {
    const postgresErrorCode = error?.cause?.code || error?.code;
    const postgresConstraint = error?.cause?.constraint || error?.constraint;

    if (
      postgresErrorCode === '23505' ||
      postgresConstraint === 'users_email_unique'
    ) {
      logger.warn('Duplicate email detected while updating user:', {
        id,
        email: updates.email,
      });
      throw new Error('User with this email already exists');
    }

    logger.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async id => {
  try {
    const deletedUsers = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (!deletedUsers || deletedUsers.length === 0) {
      throw new Error('User not found');
    }

    return deletedUsers[0];
  } catch (error) {
    logger.error('Error deleting user:', error);
    throw error;
  }
};
