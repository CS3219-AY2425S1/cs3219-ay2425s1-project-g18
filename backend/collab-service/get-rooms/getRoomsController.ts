import { Request, Response } from 'express';
import { rooms } from '../server/rooms';
import logger from '../utils/logger';

const getRooms = async (req: Request, res: Response): Promise<any> => {
    const { userId } = req.body;
    if (!userId) {
        logger.warn('getRooms called without userId');
        return res.status(400).json({ message: 'userId is required' });
    }

    for (const [roomId, room] of rooms.entries()) {
        if (room.userIds.includes(userId)) {
            logger.info(`User ${userId} found in room ${roomId}`);
            return res.status(200).json({ roomId });
        }
    }

    logger.info(`User ${userId} not found in any room`);
    return res.status(404).json({ message: 'No room found for the specified user.' });
};

export { getRooms }