import mongoose from 'mongoose';
import app from './app';
import { config } from './config/envConfig';
import logger from './utils/logger';

const PORT: string | number = config.port

const startServer = async () => {
    try {
        await mongoose.connect(config.databaseConnection);
        logger.info('Connected to MongoDB');

        app.listen(config.port, () => {
            logger.info(`Server running on port ${PORT}`);
        });

    } catch (error) {
        logger.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
};

startServer();
