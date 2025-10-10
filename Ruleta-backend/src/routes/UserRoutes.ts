import { Request, Response } from 'express';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import UserService from '@src/services/UserService';
import { CreateUserSchema, UpdateUserSchema } from '@src/validators/UserValidator';

/**
 * Get all users.
 */
async function getAll(_: Request, res: Response) {
  const users = await UserService.getAll();
  res.status(HttpStatusCodes.OK).json({ users });
}



/**
 * Update one user.
 */
async function update(req: Request, res: Response) {
  try {
    const payload = req.body?.user ?? req.body;
    const userInput = UpdateUserSchema.parse(payload);
    const user = await UserService.updateOne(userInput);
    res.status(HttpStatusCodes.OK).json({ user });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: 'Error al actualizar el usuario' });
  }
}

/**
 * Delete one user.
 */
async function delete_(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }
    await UserService.delete(id);
    res.status(HttpStatusCodes.OK).json({ message: 'User deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: 'Error al eliminar el usuario' });
  }
}

export default {
  getAll,

  update,
  delete: delete_,
} as const;
