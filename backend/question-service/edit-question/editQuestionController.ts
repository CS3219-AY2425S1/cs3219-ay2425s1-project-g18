import { Request, Response } from 'express'
import Question from '../models/question'
import { getPossibleDuplicates, getQuestionById } from '../utils/utils'
import logger from '../utils/logger'

const editQuestion = async (req: Request, res: Response) => {
    const { questionId } = req.params
    const { title, description, categories, difficulty } = req.body

    if (!questionId) {
        logger.error('Question ID required')
        return res.status(400).json({ message: 'Question ID required' })
    }

    const existingQuestion = await getQuestionById(parseInt(questionId))

    if (!existingQuestion) {
        logger.error('Question not found')
        return res.status(404).json({ message: 'Question not found' })
    }

    try {
        if (title != existingQuestion.title || description != existingQuestion.description) {
            const possibleDuplicates = await getPossibleDuplicates(
                parseInt(questionId),
                title,
                description
            )

            if (possibleDuplicates && possibleDuplicates.length > 0) {
                logger.error('Question already exists')
                return res.status(400).json({ message: 'Question already exists' })
            }
        }

        const updatedFields = { title, description, categories, difficulty }

        const updatedQuestion = await Question.findOneAndUpdate(
            { questionId },
            { $set: updatedFields },
            { new: true, runValidators: true },
        )

        logger.info(`Question ${questionId} updated successfully`)
        return res.status(200).json(updatedQuestion)
    } catch (e) {
        logger.error('Error appeared when updating question', e)
        return res
            .status(500)
            .json({ message: 'Error appeared when updating question' })
    }
}

export { editQuestion }
