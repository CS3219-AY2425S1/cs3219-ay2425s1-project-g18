export interface TimedMatchRequest {
    userId: string
    userName: string
    difficulty: string
    categories: string[]
    timestamp: number
}

export interface MatchPartner {
    userId: string
    userName: string
    questionId: number,
    title: string,
    difficulty: string
    categories: string[]
}
