import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../auth/auth_utils/jwtUtils'; 
import User from '../models/user';
import logger from '../utils/logger';

/**
 * Authentication middleware for regular users. Used to protect routes that can only be accessed users & admins who are signe in.
 */
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        name: string;
        email: string;
        isAdmin: boolean;
    };
}

const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.token;

    if (!token) {
        logger.warn('No token provided.');
        return res.status(401).json({ message: 'Authentication token missing.' });
    }

    try {
        const decoded = verifyToken(token) as { userId: string; email: string;};

        // Fetch user from database
        const user = await User.findById(decoded.userId).select('-password'); // excl password

        if (!user) {
            logger.warn('User not found.');
            return res.status(401).json({ message: 'Invalid authentication token.' });
        }

        req.user = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
        };

        next();
    } catch (error: any) {
        logger.error('Error verifying token:', error);
        return res.status(401).json({ message: 'Invalid authentication token.' });
    }
};

export { authenticate, AuthenticatedRequest };
