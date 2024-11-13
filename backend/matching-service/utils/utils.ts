import { IncomingMessage, ServerResponse } from 'http'
import SuccessfulMatch from '../models/match'
import logger from '../utils/logger'

const parseBody = async (req: IncomingMessage): Promise<any> => {
    return new Promise((resolve, reject) => {
        let body = ''

        req.on('data', (chunk: Buffer) => {
            body += chunk.toString()
        })

        req.on('end', () => {
            try {
                resolve(JSON.parse(body))
            } catch (error) {
                reject(new Error('Invalid JSON'))
            }
        })

        req.on('error', (error) => reject(error))
    })
}

const sendResponse = async (
    res: ServerResponse,
    statusCode: number,
    data: Record<string, any>,
): Promise<void> => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(data))
}

const addMatch = async (payload: any) => {
    const { matchId, collaborators, questionId } = payload

    if (
        !matchId ||
        !collaborators ||
        collaborators.length == 0 ||
        !questionId
    ) {
        return
    }

    const match = new SuccessfulMatch({
        matchId,
        collaborators,
        questionId,
    })

    try {
        await match.save()
        logger.info(`Match ${matchId} saved to database`)
    } catch (e) {
        logger.error('Error adding match to database', e)
    }
}

const updateMatch = async (payload: any) => {
    const { matchId, submissionId } = payload

    if (!matchId || !submissionId) {
        logger.error('MatchId or submissionId not provided')
        return { status: 400, message: 'MatchId or submissionId not provided' }
    }

    try {
        const match = await SuccessfulMatch.findOne({ matchId })

        if (!match) {
            logger.error(`Match ${matchId} not found`)
            return { status: 404, message: 'Match not found' }
        }

        if (match.attempts.includes(submissionId)) {
            logger.error(
                `Match ${matchId} already has submission ${submissionId}`,
            )
            return { status: 409, message: 'Match already has submission' }
        }

        match.attempts.push(submissionId)
        await match.save()
        logger.info(`Match ${matchId} updated with submission ${submissionId}`)
        return { status: 200, message: 'Match updated successfully' }
    } catch (e) {
        logger.error('Error updating match', e)
        return { status: 500, message: 'Error updating match' }
    }
}

const getMatchesWithUser = async (userId: string) => {
    try {
        const successfulMatches = await SuccessfulMatch.find({
            collaborators: { $in: [userId] },
        }).sort({ createdAt: -1 })

        logger.info(
            `Successfully fetched past successful matches for user ${userId}`,
        )
        return { status: 200, data: successfulMatches }
    } catch (e) {
        logger.error(
            `Error fetching past successful matches for user ${userId}`,
        )
        return {
            status: 500,
            message: 'Error fetching past successful matches',
        }
    }
}

const getMatch = async (matchId: string) => {
    try {
        const match = await SuccessfulMatch.findOne({ matchId })
        logger.info(
            `Successfully fetched past successful matches for user ${matchId}`,
        )
        return { status: 200, data: match }
    } catch (e) {
        logger.error(
            `Error fetching past successful matches for user ${matchId}`,
        )
        return {
            status: 500,
            message: 'Error fetching past successful matches',
        }
    }
}

export {
    parseBody,
    sendResponse,
    addMatch,
    updateMatch,
    getMatchesWithUser,
    getMatch,
}
