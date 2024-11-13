import { Router } from 'express';
import { createRoom } from './createRoomController';

const router = Router();

router.post('/create-room', createRoom);

export default router;
