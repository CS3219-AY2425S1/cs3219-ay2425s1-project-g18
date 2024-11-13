import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface CustomError extends Error {
    status?: number;
}

const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
    logger.error(`Error: ${err.message}`);
    const status = err.status || 500;
    res.status(status).json({ message: err.message || 'Internal Server Error' });
};

export default errorHandler;
