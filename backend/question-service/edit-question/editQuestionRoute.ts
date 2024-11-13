import { Router } from 'express'
import { editQuestion } from './editQuestionController'

const router = Router()
router.patch('/edit-question/:questionId', editQuestion)

export { router }
