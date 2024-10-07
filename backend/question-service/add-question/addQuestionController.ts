import { Request, Response } from 'express'
import Question from '../models/question'
import { checkQuestionExists, getNextQuestionId } from '../utils/utils'
import logger from '../utils/logger'

const addQuestion = async (req: Request, res: Response) => {
    const { title, description, categories, difficulty } = req.body
    const requiredFields: string[] = []

    if (!title) requiredFields.push('Title')
    if (!description) requiredFields.push('Description')
    if (!difficulty) requiredFields.push('Difficulty')

    if (requiredFields.length > 0) {
        return res
            .status(400)
            .json({ message: `${requiredFields.join(', ')} required` })
    }

    const questionExists = await checkQuestionExists(title, description)

    if (questionExists) {
        logger.error('Question already exists')
        return res.status(400).json({ message: 'Question already exists' })
    }

    const questionId = await getNextQuestionId()

    const newQuestion = new Question({
        questionId,
        title,
        description,
        categories,
        difficulty,
    })

    try {
        await newQuestion.save()
        logger.info(`Question added successfully: ${questionId}. ${title}`)
        return res.status(200).json({ message: 'Question added successfully' })
    } catch (e) {
        logger.error(e)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export { addQuestion }
