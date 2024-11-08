import { Router } from 'express';
import { authLiveblocksSession } from './liveblocksAuthController';

const router = Router();

router.post('/api/liveblocks-auth', authLiveblocksSession);

export default router;
