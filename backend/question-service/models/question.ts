import { Schema, model } from 'mongoose'

interface IQuestion {
    questionId: number
    title: string
    description: string
    categories: string[]
    difficulty: string
    imageUrl?: string
}

const questionSchema = new Schema<IQuestion>({
    questionId: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    categories: { type: [String], required: true },
    difficulty: { type: String, required: true },
    imageUrl: { type: String },
})

const Question = model<IQuestion>('Question', questionSchema)

export default Question
