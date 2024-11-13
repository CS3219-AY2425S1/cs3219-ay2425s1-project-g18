import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './auth/routes/authRoutes';
import errorHandler from './middleware/errorHandler';
import { config } from './config/envConfig';

const app = express();

// parse application/json
app.use(express.json()); 

// CORS config
app.use(cors({
    origin: [
        config.frontendUrl || 'http://localhost:3000',
        process.env.USER_SERVICE_URL || 'http://user_service:5000',
        process.env.QUESTION_SERVICE_URL || 'http://question_service:5001',
        process.env.MATCH_SERVICE_URL || 'http://matching_service:5002',
        process.env.CODE_COLLAB_URL || 'http://collab_service:5003',
        process.env.CODE_EXECUTION_URL || 'http://code_execution_service:5005',
        process.env.HISTORY_SERVICE_URL || 'http://history_service:5006',
     ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // allows cookies to be sent
}));

// Parse cookies
app.use(cookieParser());
app.use('/api/users', authRoutes);

// Middleware for error handling
app.use(errorHandler);

export default app;
