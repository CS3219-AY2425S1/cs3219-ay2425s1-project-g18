import { Router } from 'express'
import { addQuestion } from './addQuestionController'
import { authenticateToken } from '../utils/authMiddleware'

const router = Router()
router.post('/add-question', authenticateToken, addQuestion)

export { router }
