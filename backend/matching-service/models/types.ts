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

export interface MatchPartner {
    userId: string
    userName: string
    questionId: number,
    title: string,
    difficulty: string
    language: string
    categories: string[]
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
    question: {
        questionId: number;
        title: string;
        difficulty: string;
        language: string;
        categories: string[];
    };
}

export interface CreateMatchRequest extends Request {
    body: {
        matchId: string;
        collaborators: Types.ObjectId[];
        questionId: number;
    }
}