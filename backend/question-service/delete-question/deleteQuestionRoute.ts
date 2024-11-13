import { Router } from 'express'
import { deleteQuestion } from '../delete-question/deleteQuestionController'
import { authenticateToken } from '../utils/authMiddleware'

const router = Router()
router.delete('/delete-question/:questionId', authenticateToken, deleteQuestion)

export { router }
