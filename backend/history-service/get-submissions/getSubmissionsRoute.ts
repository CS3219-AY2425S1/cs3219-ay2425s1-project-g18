import { RequestHandler, Router } from 'express'
import { getSubmissions } from './getSubmissionsController'

const router = Router()
router.get('/submissions/:matchId', getSubmissions as unknown as RequestHandler)

export { router }