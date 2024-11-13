import { Request, Response } from 'express';
import { createRoomId } from '../utils/utils';
import { rooms } from '../server/rooms';
import { Room } from '../models/types';
import logger from '../utils/logger';

const createRoom = async (req: Request, res: Response):Promise<any> => {
    const { userId1, userId2, language, question, matchId } = req.body;

    if (!userId1 || !userId2 || !language || !question) {
        return res.status(400).json({ message: 'userId1, userId2, language, question are all required' });
    }

    const roomId = createRoomId(userId1, userId2);
    logger.info(`Request to create room with ID ${roomId} received`)

    if (rooms.has(roomId)) {
        return res.status(400).json({ message: 'Room already exists', roomId });
    }

    const newRoom: Room = {
        roomId,
        userIds: [userId1, userId2],
        language: language,
        question: question,
        matchId
    };

    logger.info(`New Room with question ${newRoom.question.title} created`)

    rooms.set(roomId, newRoom);

    return res.status(200).json({ roomId, language });
};

export {createRoom}