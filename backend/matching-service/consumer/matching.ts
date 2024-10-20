import axios from 'axios'
import dotenv from 'dotenv'
import { TimedMatchRequest, MatchPartner } from '../models/types'
import logger from '../utils/logger'

dotenv.config({ path: './.env' })

const performMatching = async (
    req: TimedMatchRequest,
    activeRequests: TimedMatchRequest[],
): Promise<MatchPartner | null> => {
    let bestMatch: TimedMatchRequest | null = null
    let maxCommonCategories = 0

    for (const curr of activeRequests) {
        if (curr.userId === req.userId) continue

        if (curr.difficulty === req.difficulty) {
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
            logger.error('Error occurred when fetching question for match')
            return null
        }

        const matchPartner: MatchPartner = {
            userId: bestMatch.userId,
            userName: bestMatch.userName,
            questionId: res.data.questionId,
            title: res.data.title,
            difficulty: bestMatch.difficulty,
            categories: res.data.categories
        }

        logger.info(`Matched ${req.userName} with ${bestMatch.userName}`)
        return matchPartner
    }
    return null
}

export { performMatching }
