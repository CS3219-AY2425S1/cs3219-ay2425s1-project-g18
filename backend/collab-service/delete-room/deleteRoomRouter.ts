import { Router } from 'express';
import { deleteRoom } from './deleteRoomController';

const router = Router();

router.delete('/delete-room', deleteRoom);

export default router;
