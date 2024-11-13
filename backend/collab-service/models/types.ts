export interface ITestCase {
    input: any,
    expected: any
}

interface Question {
    questionId: number
    title: string
    description: string
    categories: string[]
    difficulty: string
    imageUrl?: string
    testCases: ITestCase[]
}

interface Room {
    roomId: string;
    userIds: string[];
    language: string;
    question: Question;
    matchId: string;
}

export { Room }