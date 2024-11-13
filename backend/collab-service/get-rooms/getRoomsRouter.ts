import { Router } from 'express';
import { getRooms } from './getRoomsController';

const router = Router();

router.post('/get-rooms', getRooms);

export default router;
