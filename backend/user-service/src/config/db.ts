import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const url: string | undefined = process.env.DATABASE_CONNECTION;

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
