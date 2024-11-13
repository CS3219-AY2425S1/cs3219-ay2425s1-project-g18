import { Request, Response } from 'express';
import logger from '../../utils/logger';
import { verifyToken } from '../auth_utils/jwtUtils';
import { checkIsAdmin } from '../db_utils/checkAdminService';


/**
 * This returns isAuthenticated, which is a boolen for whether the user is signed in.
 */
const checkAdminController = async (req: Request, res: Response) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(200).json({ isAuthenticated: false });
    }

    try {
        const decoded = verifyToken(token) as { userId: string; email: string;};

        logger.info('Token verified successfully!')

        return res.status(200).json({ isAuthenticated: await checkIsAdmin(decoded.userId) });
    } catch (error) {
        logger.warn('Token verification failed.')
        console.error('JWT verification failed:', error);
        return res.status(200).json({ isAuthenticated: false });
    }
};

export { checkAdminController };
