import { RequestHandler, Router } from 'express'
import { executeUserCode } from './executeCodeController'

const router = Router()
router.post('/execute-code', executeUserCode as unknown as RequestHandler)

export { router }
