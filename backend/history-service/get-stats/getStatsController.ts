import axios, { AxiosResponse } from 'axios'
import { Response } from 'express'
import logger from '../utils/logger'
import { GetUserMatchRequest } from '../models/types'
import { getUserStatsMap } from '../utils/utils'

const getUserStats = async (req: GetUserMatchRequest, res: Response) => {
    const { userId } = req.params

    try {
        const userMatchesRes = await axios.get(
            `${process.env.MATCH_SERVICE_URL}/get-user-match-history/${userId}`,
        )
        const userMatches = userMatchesRes.data.data
        const userMatchesWithSubmissions = userMatches.filter(
            (match: any) => match.attempts.length > 0,
        )

        const submissionRetrievalPromises = userMatchesWithSubmissions.map((match: any) => {
            return axios.get(
                `${process.env.CODE_EXECUTION_SERVICE_URL}/get-code/${match.matchId}`,
            )
        })

        const resolvedSubmissionData = await Promise.all(submissionRetrievalPromises)
        const unsortedQuestionIds = resolvedSubmissionData
            .flatMap((submission: AxiosResponse) => submission.data)
            .filter((submission) => submission.solved)
            .map((submission) => submission.questionId)

        const questionIds = [...new Set(unsortedQuestionIds)].sort(
            (a, b) => parseInt(a) - parseInt(b),
        )
        const questionData = await Promise.all(
            questionIds.map(async (questionId) => {
              const response = await axios.get(
                `${process.env.QUESTION_SERVICE_URL}/get-questions?questionId=${questionId}`
              )
              return response.data[0] 
            })
        )

        const userMap = getUserStatsMap(questionData)
        logger.info(`Successfully fetched statistics for user ${userId}`)
        return res.status(200).json({ data: userMap })
    } catch (e) {
        logger.error(`Error fetching statistics for user ${userId}`)
        return res
            .status(500)
            .json({ message: `Error fetching statistics for user ${userId}` })
    }
}

export { getUserStats }
