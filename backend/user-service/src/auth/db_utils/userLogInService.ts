import User from '../../models/user';
import bcrypt from 'bcryptjs';
import logger from '../../utils/logger';
import { generateToken } from '../auth_utils/jwtUtils';

interface LoginInput {
    email: string;
    password: string;
}

interface UserInfo {
    name: string;
    email: string;
}

interface LoginResponse {
    token: string;
    accessToken: string;
    user: UserInfo;
}

export const loginUser = async ({ email, password }: LoginInput): Promise<LoginResponse> => {
    const user = await User.findOne({ email });
    if (!user) {
        logger.warn('User not found.');
        throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        logger.warn('Wrong password.');
        throw new Error('Invalid email or password');
    }

    const refreshToken = generateToken(user);
    const accessToken = generateToken(user, '5s') // testing
    
    const userInfo: UserInfo = {
        name: user.name,
        email: user.email,
    };

    return { token: refreshToken, accessToken: accessToken, user: userInfo };
};
