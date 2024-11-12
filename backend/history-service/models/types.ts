import  { Request, Response } from 'express'

export interface GetUserMatchRequest extends Request {
    body: {
        userId: string
    }
}

export interface GetSubmissionRequest extends Request {
    body: {
        matchId: string
    }
}

export interface UserStatsMap {
    difficulty: Record<string, number>,
    categories: Record<string, number>
}