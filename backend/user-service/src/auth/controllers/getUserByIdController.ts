import { Request, Response } from 'express';
import logger from '../../utils/logger';
import { findUserById } from '../db_utils/findUserById';

const getUserById = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    logger.error('User ID required');
    return res.status(400).json({ message: 'User ID required' });
  }

  try {
    const user = await findUserById(userId);

    res.status(200).json({ user });
  } catch (error: any) {
    logger.error('Error fetching user:', error);
    res.status(404).json({ message: 'User not found' });
  }
};

export { getUserById };