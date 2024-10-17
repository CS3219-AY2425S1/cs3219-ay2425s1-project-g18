import { Router } from 'express'
import { getQuestionsByFilter } from './getQuestionsController'

const router = Router()
router.get('/get-questions', getQuestionsByFilter)

export { router }
