import { Server } from 'socket.io'
import { TimedMatchRequest, MatchPartner } from '../models/types'
import logger from '../utils/logger'

const sendMatchResult = async (
    req: TimedMatchRequest,
    partner: MatchPartner,
    io: Server,
    connectedClients: Map<string, string>,
) => {
    const requestSockId = connectedClients.get(req.userId)
    const partnerSockId = connectedClients.get(partner.userId)

    if (requestSockId) {
        io.to(requestSockId).emit('matchFound', partner)
    }

    if (partnerSockId) {
        const requester: MatchPartner = {
            userId: req.userId,
            userName: req.userName,
            questionId: partner.questionId,
            title: partner.title,
            difficulty: req.difficulty,
            categories: partner.categories,
        }

        io.to(partnerSockId).emit('matchFound', requester)
    }

    logger.info(`Match partners sent to ${req.userId} and ${partner.userId}`)
}

export { sendMatchResult }
