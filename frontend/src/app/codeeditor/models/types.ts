export interface ITestCase {
    input: any,
    expected: any
}

export interface Question {
    questionId: number
    title: string
    description: string
    categories: string[]
    difficulty: string
    imageUrl?: string
    testCases: ITestCase[]
}

export interface CollaborativeSpaceProps {
    initialCode?: string;
    language?: string;
    theme?: 'light' | 'vs-dark';
    roomId: string;
    userName: string;
    question: Question;
    matchId?: string;
}
