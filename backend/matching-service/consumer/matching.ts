import axios from 'axios'
import { TimedMatchRequest, MatchPartner } from '../models/types'
import logger from '../utils/logger'

const performMatching = async (
    req: TimedMatchRequest,
    activeRequests: TimedMatchRequest[],
): Promise<MatchPartner | null> => {
    let bestMatch: TimedMatchRequest | null = null
    let maxCommonCategories = 0

    logger.info(`Attempting to match user ${req.userId} with active requests: ${activeRequests.map(r => r.userId).join(', ')}`)

    for (const curr of activeRequests) {
        if (curr.userId === req.userId) continue

        if (curr.language == req.language && curr.difficulty === req.difficulty) {
            const commonCategories = req.categories.filter((category) =>
                curr.categories.includes(category),
            )

            if (commonCategories.length > maxCommonCategories) {
                maxCommonCategories = commonCategories.length
                bestMatch = curr
            }
        }
    }

    if (bestMatch) {
        logger.info(`Best match for user ${req.userId} is user ${bestMatch.userId} with ${maxCommonCategories} common categories`)
        const commonCategories = req.categories.filter((category) =>
            bestMatch!.categories.includes(category),
        )

        const res = await axios.get(
            `${process.env.QUESTION_SERVICE_URL}/get-random-question`,
            {
                params: {
                    categories: commonCategories.join(','),
                    difficulty: bestMatch.difficulty
                },
                validateStatus: (status: number) => status >= 200 && status < 500
            },
        )

        if (res.status !== 200) {
            logger.error(`Error occurred when fetching question for match for user ${req.userId}`)
            return null
        }

        const matchPartner: MatchPartner = {
            userId: bestMatch.userId,
            userName: bestMatch.userName,
            language: req.language,
            question: {
                questionId: res.data.questionId,
                title: res.data.title,
                description: res.data.description,
                difficulty: res.data.difficulty,
                categories: res.data.categories,
                testCases: res.data.testCases
            }
            
        }

        logger.info(`Matched ${req.userName} with ${bestMatch.userName}`)
        return matchPartner
    }
    logger.info(`No match found for user ${req.userId}`)
    return null
}

export { performMatching }
