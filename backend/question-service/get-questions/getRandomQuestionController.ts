import { Request, Response } from 'express'
import Question from '../models/question'
import logger from '../utils/logger'

const getRandomQuestion = async (req: Request, res: Response) => {
    try {
        const { categories, difficulty } = req.query
        let filter: any = {}

        if (categories) {
            const categoryArray =
                typeof categories === 'string'
                    ? categories.split(',')
                    : categories
            filter.categories = { $all: categoryArray }
        }

        if (difficulty) {
            filter.difficulty = { $regex: difficulty, $options: 'i' }
        }

        const retrievedQuestions = await Question.find(filter)

        if (!retrievedQuestions || retrievedQuestions.length === 0) {
            logger.error('No questions found')
            return res.status(400).json({ message: 'No questions found' })
        }

        const n = retrievedQuestions.length
        const randomIndex = Math.floor(Math.random() * n)
        const randomQuestion = retrievedQuestions[randomIndex]

        let logMessage = `Question chosen`

        if (difficulty) {
            logMessage += ` with difficulty ${difficulty}`
        }

        if (categories) {
            logMessage += ` and category ${categories}`
        }

        logMessage += `: ${randomQuestion.questionId} ${randomQuestion.title} `
        logger.info(logMessage)
        return res.status(200).json(randomQuestion)
    } catch (e) {
        logger.error('Error appeared when retrieving questions', e)
        return res
            .status(500)
            .json({ message: 'Error appeared when retrieving questions' })
    }
}

export { getRandomQuestion }
