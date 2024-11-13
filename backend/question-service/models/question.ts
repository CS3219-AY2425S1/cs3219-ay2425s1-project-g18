import { Schema, model } from 'mongoose'

export interface ITestCase {
    input: any,
    expected: any
}
interface IQuestion {
    questionId: number
    title: string
    description: string
    categories: string[]
    difficulty: string
    imageUrl?: string
    testCases: ITestCase[]
}

const testCaseSchema = new Schema<ITestCase>({
    input: { type: Schema.Types.Mixed, required: true },
    expected: { type: Schema.Types.Mixed, required: true }
})

const questionSchema = new Schema<IQuestion>({
    questionId: { type: Number, required: true, unique: true },
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true, unique: true },
    categories: { type: [String], required: true },
    difficulty: { type: String, required: true },
    imageUrl: { type: String },
    testCases: { type: [testCaseSchema], required: true }
})

const Question = model<IQuestion>('Question', questionSchema)

export default Question
