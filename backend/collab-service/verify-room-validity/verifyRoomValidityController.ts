import { Request, Response } from 'express';
import { rooms } from '../server/rooms';
import logger from '../utils/logger';

export const verifyRoom = (req: Request, res: Response): void => {
    const { roomId, userId } = req.body;

    if (!roomId || !userId) {
        logger.info(`Room Validity Check: Insufficient information given. userId: ${userId}, roomId: ${roomId}`)
        res.status(400).json({ message: 'roomId and userId are required' });
        return;
    }

    const room = rooms.get(roomId);

    if (!room) {
        logger.info(`Room Validity Check: Room not found.`)
        res.status(404).json({ message: 'Room not found' });
        return;
    }

    if (!room.userIds.includes(userId)) {
        logger.info(`Room Validity Check: User ${userId} is not authorised in room ${roomId}`)
        res.status(403).json({ message: 'User is not authorized to access this room' });
        return;
    }

    logger.info(`Room Validity Check: Room and user are both valid and authorised.`)
    res.status(200).json({ 
        message: 'Room is valid', 
        room_id: roomId,
        language: room.language,
        question: room.question, 
        matchId: room.matchId
    });
};
