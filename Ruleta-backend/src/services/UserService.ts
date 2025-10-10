import { RouteError } from '@src/common/util/route-errors';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import SqlUser, { IUserAttributes } from '@src/models/SqlUser';
import {  UpdateUserInput } from '@src/validators/UserValidator';

/******************************************************************************
                                Constants
******************************************************************************/

export const USER_NOT_FOUND_ERR = 'User not found';

/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Get all users.
 */
async function getAll(): Promise<IUserAttributes[]> {
  const users = await SqlUser.findAll({
    order: [['createdAt', 'DESC']]
  });
  return users.map(user => user.toJSON());
}


/**
 * Update one user.
 */
async function updateOne(userData: UpdateUserInput): Promise<IUserAttributes> {
  const user = await SqlUser.findByPk(userData.id);
  if (!user) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      USER_NOT_FOUND_ERR,
    );
  }

  await user.update({
    username: userData.username ?? user.username,
    email: userData.email ?? user.email,
    fullName: userData.fullName ?? user.fullName,
    phone: userData.phone ?? user.phone,
    balance: userData.balance ?? user.balance,
    wins: userData.wins ?? user.wins,
    losses: userData.losses ?? user.losses,
    role: userData.role ?? user.role,
    lastLogin: userData.lastLogin ?? user.lastLogin,
  });

  return user.toJSON();
}

/**
 * Delete a user by their id.
 */
async function _delete(id: number): Promise<void> {
  const user = await SqlUser.findByPk(id);
  if (!user) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      USER_NOT_FOUND_ERR,
    );
  }
  await user.destroy();
}

/**
 * Get user by username.
 */
async function getByUsername(username: string): Promise<IUserAttributes | null> {
  const user = await SqlUser.findOne({ where: { username } });
  return user ? user.toJSON() : null;
}

/**
 * Get user by email.
 */
async function getByEmail(email: string): Promise<IUserAttributes | null> {
  const user = await SqlUser.findOne({ where: { email } });
  return user ? user.toJSON() : null;
}

/**
 * Update user balance.
 */
async function updateBalance(username: string, newBalance: string): Promise<IUserAttributes> {
  const user = await SqlUser.findOne({ where: { username } });
  if (!user) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      USER_NOT_FOUND_ERR,
    );
  }

  await user.update({ balance: newBalance });
  return user.toJSON();
}

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  getAll,

  updateOne,
  delete: _delete,
  getByUsername,
  getByEmail,
  updateBalance,
} as const;