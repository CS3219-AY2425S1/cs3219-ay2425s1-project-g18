import { Router } from 'express'
import { addQuestion } from './addQuestionController'

const router = Router()
router.post('/add-question', addQuestion)

export { router }
