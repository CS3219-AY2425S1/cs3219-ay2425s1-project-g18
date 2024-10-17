import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './auth/routes/authRoutes';
import errorHandler from './middleware/errorHandler';

const app = express();

// parse application/json
app.use(express.json()); 

// CORS config
app.use(cors({
    origin: 'http://localhost:3000', // Replace with frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // allows cookies to be sent
}));

// Parse cookies
app.use(cookieParser());
app.use('/api/users', authRoutes);

// Middleware for error handling
app.use(errorHandler);

export default app;
