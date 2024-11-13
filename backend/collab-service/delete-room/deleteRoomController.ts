import { Request, Response } from 'express'
import { rooms } from '../server/rooms'
import logger from '../utils/logger'

const deleteRoom = async (req: Request, res: Response): Promise<any> => {
    const roomId = (req.query.roomId as string);

    logger.info(`Request to delete room with ID ${roomId} received`)

    if (!rooms.has(roomId)) {
        return res.status(404).json({ message: 'Room does not exist', roomId })
    }

    rooms.delete(roomId)
    return res.status(200).json({ message: 'Room deleted', roomId })
}

export { deleteRoom }
