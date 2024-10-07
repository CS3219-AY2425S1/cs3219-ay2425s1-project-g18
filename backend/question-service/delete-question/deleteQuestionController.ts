import { Request, Response } from 'express'
import Question from '../models/question'
import logger from '../utils/logger'

const deleteQuestion = async (req: Request, res: Response) => {
    const { questionId } = req.params

    if (!questionId) {
        logger.error('Question ID required')
        return res.status(400).json({ message: 'Question ID required' })
    }

    try {
        const deletedQuestion = await Question.findOneAndDelete({ questionId })

        if (!deletedQuestion) {
            logger.error('Question not found')
            return res.status(400).json({ message: 'Question not found' })
        }

        await Question.updateMany(
            { questionId: { $gt: questionId } },
            { $inc: { questionId: -1 } },
        )

        logger.info(
            `Question ${questionId} deleted successfully and question IDs updated`,
        )
        return res
            .status(200)
            .json({ message: 'Question deleted successfully' })
    } catch (e) {
        logger.error('Error appeared when deleting question', e)
        return res
            .status(500)
            .json({ message: 'Error appeared when deleting question' })
    }
}

export { deleteQuestion }
