import { Router } from 'express';
import { verifyRoom } from './verifyRoomValidityController';

const router = Router();

router.post('/verify-room', verifyRoom);

export default router;
