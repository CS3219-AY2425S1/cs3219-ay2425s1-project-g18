import Question from '../models/question'

const checkQuestionExists = async (
    title: string,
    description: string,
    categories: string[],
    difficulty: string,
) => {
    try {
        const question = await Question.findOne({
            title,
            description,
            categories,
            difficulty,
        })

        if (question) {
            return true
        }
        return false
    } catch (e) {
        console.log(e)
    }
}

const getQuestionById = async (questionId: number) => {
    try {
        const question = await Question.findOne({ questionId })

        if (question) {
            return question
        }
        return 
    } catch (e) {
        console.log(e)
    }
}

const getNextQuestionId = async () => {
    try {
        const maxId = await Question.find().sort({ questionId: -1 }).limit(1)

        if (maxId.length === 0) {
            return 1
        }
        return maxId[0].questionId + 1
    } catch (e) {
        console.log(e)
    }
}

export { checkQuestionExists, getQuestionById, getNextQuestionId }
