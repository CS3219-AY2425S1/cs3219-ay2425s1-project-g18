import { RequestHandler, Router } from 'express'
import { getUserMatch } from './getMatchController'

const router = Router()
router.get('/match-history/:matchId', getUserMatch as unknown as RequestHandler)

export { router }