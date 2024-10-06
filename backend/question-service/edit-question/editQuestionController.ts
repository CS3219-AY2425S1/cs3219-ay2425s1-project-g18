import { Request, Response } from 'express'
import Question from '../models/question'
import { checkQuestionExists, getQuestionById } from '../utils/utils'

const editQuestion = async (req: Request, res: Response) => {
    const { questionId } = req.params
    const { title, description, categories, difficulty } = req.body

    if (!questionId) {
        return res.status(400).send('Question ID required')
    }

    const existingQuestion = await getQuestionById(parseInt(questionId))

    if (!existingQuestion) {
        return res.status(404).send('Question not found')
    }

    try {
        const updatedFields: any = {}

        if (title) updatedFields.title = title
        if (description) updatedFields.description = description
        if (categories) updatedFields.categories = categories
        if (difficulty) updatedFields.difficulty = difficulty

        if (Object.keys(updatedFields).length === 0) {
            return res.status(400).send('At least one field required to update question')
        }

        const isDuplicate = await checkQuestionExists(
            updatedFields.title || existingQuestion.title,
            updatedFields.description || existingQuestion.description,
            updatedFields.categories || existingQuestion.categories,
            updatedFields.difficulty || existingQuestion.difficulty
        )

        if (isDuplicate) {
            return res.status(400).send('Question already exists')
        }

        const updatedQuestion = await Question.findOneAndUpdate(
            { questionId },
            { $set: updatedFields },
            { new: true, runValidators: true }
        )

        if (!updatedQuestion) {
            return res.status(404).send('Question not found')
        }

        return res.status(200).json(updatedQuestion)
    } catch (e) {
        return res.status(500).send('Error appeared when updating question')
    }
}

export { editQuestion }
