import { RequestHandler, Router } from 'express'
import { getCollaborator } from './getUserController'

const router = Router()
router.get('/collaborators/:userId', getCollaborator as unknown as RequestHandler)

export { router }