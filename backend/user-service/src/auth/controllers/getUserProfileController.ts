import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import logger from '../../utils/logger';



const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    logger.warn('User data not found in request.');
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  try {
    res.status(200).json({ user: req.user });
  } catch (error: any) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export { getUserProfile };
