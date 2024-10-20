import { Router } from 'express'
import { getQuestionsByFilter } from './getQuestionsController'
import { getRandomQuestion } from './getRandomQuestionController'

const router = Router()

router.get('/get-questions', getQuestionsByFilter)
router.get('/get-random-question', getRandomQuestion)

export { router }
