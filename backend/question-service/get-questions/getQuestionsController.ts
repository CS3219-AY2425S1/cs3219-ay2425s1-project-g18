import { Request, Response } from 'express'
import Question from '../models/question'
import logger from '../utils/logger'

const getQuestionsByFilter = async (req: Request, res: Response) => {
    try {
        const { questionId, title, categories, difficulty } = req.query
        let filter: any = {}

        if (questionId) {
            filter.questionId = questionId
        }

        if (title) {
            filter.title = { $regex: title, $options: 'i' }
        }

        if (categories) {
            const categoryArray =
                typeof categories === 'string'
                    ? categories.split(',')
                    : categories
            filter.categories = { $in: categoryArray }
        }

        if (difficulty) {
            filter.difficulty = { $regex: difficulty, $options: 'i' }
        }

        const retrievedQuestions = await Question.find(filter)

        if (!retrievedQuestions) {
            logger.error('No questions found')
            return res.status(400).json({ message: 'No questions found' })
        }

        return res.status(200).json(retrievedQuestions)
    } catch (e) {
        logger.error('Error appeared when retrieving questions', e)
        return res
            .status(500)
            .json({ message: 'Error appeared when retrieving questions' })
    }
}

export { getQuestionsByFilter }
