// cONFIG OBJECT FOR ENV
export const config = {
    jwtSecret: process.env.JWT_SECRET as string,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '14d', // 2 WEEKS
    databaseConnection: process.env.DATABASE_CONNECTION as string,
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV as string,
    frontendUrl: process.env.FRONTEND_URL as string,
    cookieSameSiteSetting: process.env.COOKIE_SAME_SITE as string || 'strict'
};
