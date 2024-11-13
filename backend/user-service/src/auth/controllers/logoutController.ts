import { config } from "../../config/envConfig";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { Response } from 'express';

const userLogoutController = async(req: AuthenticatedRequest, res: Response) => {
    var cookieSameSiteSetting: boolean | "strict" | "none" | "lax" | undefined;
    if (config.cookieSameSiteSetting == "strict" || config.cookieSameSiteSetting == "none" || config.cookieSameSiteSetting == "lax") {
        cookieSameSiteSetting = config.cookieSameSiteSetting
    } else {
        cookieSameSiteSetting = 'strict'
    }
    
    res.clearCookie('token', {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: cookieSameSiteSetting,
    });
    res.status(200).json({ message: 'Logged out successfully.' });
}

export { userLogoutController };