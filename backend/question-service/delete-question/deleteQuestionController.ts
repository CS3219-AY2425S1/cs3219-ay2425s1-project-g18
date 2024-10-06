import { Request, Response } from 'express'
import Question from '../models/question'

const deleteQuestion = async (req: Request, res: Response) => {
    const { questionId } = req.params

    if (!questionId) {
        return res.status(400).send('Question ID required')
    }

    try {
        const deletedQuestion = await Question.findOneAndDelete({ questionId })

        if (!deletedQuestion) {
            return res.status(400).send('Question not found')
        }

        await Question.updateMany(
            { questionId: { $gt: questionId } },
            { $inc: { questionId: -1 } },
        )
        return res
            .status(200)
            .send('Question deleted successfully and question IDs updated')
    } catch (e) {
        return res.status(500).send('Error appeared when deleting question')
    }
}

export { deleteQuestion }
