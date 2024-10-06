import { Request, Response, CookieOptions } from 'express';
import { loginUser } from '../db_utils/userLogInService';
import { connectToDatabase } from '../../config/db';
import { logInValidator } from '../auth_utils/loginValidator';
import logger from '../../utils/logger';
import { config } from '../../config/envConfig';
import ms from 'ms'

const userLoginController = async (req: Request, res: Response) => {
    // Validate input
    const { error, value } = logInValidator.validate(req.body);

    if (error) {
        logger.warn(`Login validation failed: ${error.details[0].message}`);
        return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = value;

    try {
        await connectToDatabase();

        const { token, user } = await loginUser({ email, password });

        // Define cookie options
        const cookieOptions: CookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: ms(config.jwtExpiresIn), // should be 2 weeks in ms, but expiration can be changed in .env
        };

        // Set the token in an HttpOnly cookie
        res.cookie('token', token, cookieOptions);

        logger.info(`User logged in successfully: ${email}`);
        res.status(200).json({ message: 'Logged in successfully.', user });
    } catch (error: any) {
        if (error.message === 'Invalid email or password') {
            logger.warn(`Login failed for ${email}: ${error.message}`);
            return res.status(401).json({ message: error.message });
        }
        logger.error(`Login error: ${error.message}`);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export { userLoginController };
