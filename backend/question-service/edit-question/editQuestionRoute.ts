import { Router } from 'express'
import { editQuestion } from './editQuestionController'
import { authenticateToken } from '../utils/authMiddleware'

const router = Router()
router.patch('/edit-question/:questionId', authenticateToken, editQuestion)

export { router }
