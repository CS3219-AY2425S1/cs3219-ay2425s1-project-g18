import dotenv from 'dotenv';
import path from 'path';
import logger from '../utils/logger';

require('dotenv').config({ path: path.resolve(__dirname, './../../.env') })

const env = process.env.NODE_ENV || 'development';

dotenv.config({ path: path.resolve(__dirname, `./../../.env.${env}`) });

const requiredEnvVars = ['JWT_SECRET', 'DATABASE_CONNECTION', 'PORT'];

// Validate that all required environment variables are set
requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
        throw new Error(`FATAL ERROR: ${varName} is not defined.`);
    }
});

// Export the configuration object
export const config = {
    jwtSecret: process.env.JWT_SECRET as string,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '14d', // 2 WEEKS
    databaseConnection: process.env.DATABASE_CONNECTION as string,
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
};
