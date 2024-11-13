import { Router } from 'express'
import { deleteQuestion } from '../delete-question/deleteQuestionController'

const router = Router()
router.delete('/delete-question/:questionId', deleteQuestion)

export { router }
