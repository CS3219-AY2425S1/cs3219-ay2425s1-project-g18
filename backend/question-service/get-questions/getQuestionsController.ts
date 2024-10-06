import { Request, Response } from 'express'
import Question from '../models/question'

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
            filter.difficulty = difficulty
        }

        const retrievedQuestions = await Question.find(filter)

        if (!retrievedQuestions) {
            return res.status(400).send('No questions found')
        }

        return res.status(200).json(retrievedQuestions)
    } catch (e) {
        return res.status(500).send('Error appeared when retrieving questions')
    }
}

export { getQuestionsByFilter }
