import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { connectToDatabase } from './db'
import { router as addQuestionRoute } from '../add-question/addQuestionRoute'
import { router as deleteQuestionRoute } from '../delete-question/deleteQuestionRoute'
import { router as getQuestionsRoute } from '../get-questions/getQuestionsRoute'
import { router as editQuestionRoute } from '../edit-question/editQuestionRoute'
import logger from '../utils/logger'

dotenv.config({ path: './.env' })

const app = express()
app.use(express.json())
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        process.env.USER_SERVICE_URL || 'http://user_service:5000',
        process.env.QUESTION_SERVICE_URL || 'http://question_service:5001',
        process.env.MATCHING_SERVICE_URL || 'http://matching_service:5002',
        process.env.CODE_COLLAB_URL || 'http://collab_service:5003',
        process.env.CODE_EXECUTION_URL || 'http://code_execution_service:5005',
        process.env.HISTORY_SERVICE_URL || 'http://history_service:5006',
     ], 
    credentials: true, // allows cookies to be sent
}));

app.use(express.static('build'))

const port: string | undefined = process.env.PORT

connectToDatabase()

app.use(addQuestionRoute)
app.use(deleteQuestionRoute)
app.use(getQuestionsRoute)
app.use(editQuestionRoute)

app.listen(port, () => {
    logger.info(`Server running on port ${port}`)
})
