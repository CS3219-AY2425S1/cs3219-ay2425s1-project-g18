import { RequestHandler, Router } from 'express'
import { getUserStats } from './getStatsController'

const router = Router()
router.get('/stats/:userId', getUserStats as unknown as RequestHandler)

export { router }