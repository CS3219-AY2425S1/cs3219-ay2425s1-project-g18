import { Schema, model, models, Document } from 'mongoose';

export interface ISubmission extends Document {
    matchId: string,
    questionId: number
    language: string
    code: string
    solved: boolean
    testCasesPassed: number
    testCasesTotal: number
}   

const SubmissionSchema = new Schema<ISubmission>(
    {
        matchId: { type: String, required: true, unique: true, index: true },
        questionId: { type: Number, required: true, index: true },
        language: { type: String, required: true },
        code: { type: String, required: true, default: '' },
        solved: { type: Boolean },
        testCasesPassed: { type: Number, default: 0 },
        testCasesTotal: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

const Submission = models.Submission || model<ISubmission>('Submission', SubmissionSchema);

export default Submission;