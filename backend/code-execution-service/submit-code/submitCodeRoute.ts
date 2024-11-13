import { RequestHandler, Router } from 'express'
import { submitUserCode } from './submitCodeController'

const router = Router()
router.post('/submit-code', submitUserCode as unknown as RequestHandler)

export { router }
