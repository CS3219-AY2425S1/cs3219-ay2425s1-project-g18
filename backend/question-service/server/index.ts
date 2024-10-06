import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { connectToDatabase } from './db'
import { router as addQuestionRoute } from '../add-question/addQuestionRoute'
import { router as deleteQuestionRoute } from '../delete-question/deleteQuestionRoute'
import { router as getQuestionsRoute } from '../get-questions/getQuestionsRoute'
import { router as editQuestionRoute } from '../edit-question/editQuestionRoute'

dotenv.config({ path: './.env' })

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('build'))

const port: string | undefined = process.env.PORT

connectToDatabase()

app.use(addQuestionRoute)
app.use(deleteQuestionRoute)
app.use(getQuestionsRoute)
app.use(editQuestionRoute)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
