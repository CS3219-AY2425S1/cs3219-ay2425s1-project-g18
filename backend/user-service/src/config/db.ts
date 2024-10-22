import mongoose from 'mongoose';
import { config } from './envConfig';

const url: string | undefined = config.databaseConnection;

if (!url) {
    throw new Error('Database connection URL is missing');
}

export const connectToDatabase = async () => {
    if (mongoose.connection.readyState >= 1) return;

    try {
        await mongoose.connect(url);
        console.log('Connected to the user service database');
    } catch (error) {
        console.error('Cannot connect to the user service database', error);
        throw error;
    }
};
