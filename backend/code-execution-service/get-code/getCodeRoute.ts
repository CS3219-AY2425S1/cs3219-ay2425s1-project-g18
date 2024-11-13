import { RequestHandler, Router } from 'express'
import { getUserCode } from './getCodeController'

const router = Router()
router.get('/get-code/:matchId', getUserCode as unknown as RequestHandler)

export { router }