import { Request } from 'express'
import { Types } from 'mongoose'

export interface TimedMatchRequest {
    userId: string
    userName: string
    difficulty: string
    language: string
    categories: string[]
    timestamp: number
}

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


export interface MatchPartner {
    userId: string
    userName: string
    language: string
    question: IQuestion
}

export interface MatchSession {
    matchId: string;
    users: {
        [userId: string]: {
            userName: string;
            socketId: string;
            hasAccepted: boolean;
        };
    };
    question: IQuestion;
    language: string;
}

export interface CreateMatchRequest extends Request {
    body: {
        matchId: string;
        collaborators: Types.ObjectId[];
        questionId: number;
    }
}