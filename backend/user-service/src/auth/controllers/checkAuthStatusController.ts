import { Request, Response } from 'express';
import logger from '../../utils/logger';
import { verifyToken } from '../auth_utils/jwtUtils';
import User from '../../models/user';

/**
 * This returns isAuthenticated, which is a boolean for whether the user is signed in.
 */
const authStatusController = (req: Request, res: Response) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(200).json({ isAuthenticated: false });
    }

    try {
        const decoded = verifyToken(token);
        logger.info('Token verified successfully!')
        return res.status(200).json({ isAuthenticated: true });
    } catch (error) {
        logger.warn('Token verification failed.')
        console.error('JWT verification failed:', error);
        return res.status(200).json({ isAuthenticated: false });
    }
};

export { authStatusController };
