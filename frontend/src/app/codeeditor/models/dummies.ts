import {Question, ITestCase} from '../models/types'

const DUMMY_TEST_CASE: ITestCase = {input: "DUMMY", expected: "DUMMY"}

export const DUMMY_QUESTION: Question = {
    questionId: 420,
    title: "Hmmm... something went wrong",
    description: "This is a dummy question. Something went wrong with loading your question.",
    categories: ['Brainteaser', 'Dynamic Programming', 'Algorithms'],
    difficulty: 'Hard',
    testCases: [DUMMY_TEST_CASE]
}
