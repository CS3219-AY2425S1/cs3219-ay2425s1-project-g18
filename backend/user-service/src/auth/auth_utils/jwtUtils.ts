import jwt from 'jsonwebtoken';
import { config } from '../../config/envConfig'; // centralized config
import { IUser } from '../../models/user';

export const generateToken = (user: IUser): string => {
    return jwt.sign(
        { userId: user._id, email: user.email },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
    );
};

export const verifyToken = (token: string): any => {
    try {
        return jwt.verify(token, config.jwtSecret);
    } catch (error) {
        throw new Error('Invalid token');
    }
};