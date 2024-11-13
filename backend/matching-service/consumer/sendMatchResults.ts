import { Server } from 'socket.io'
import { TimedMatchRequest, MatchPartner, MatchSession } from '../models/types'
import logger from '../utils/logger'
import { v4 as uuidv4 } from 'uuid';

const sendMatchResult = async (
    req: TimedMatchRequest,
    partner: MatchPartner,
    io: Server,
    connectedClients: Map<string, string>,
    activeMatches: Map<string, MatchSession>
) => {
    const requestSockId = connectedClients.get(req.userId);
    const partnerSockId = connectedClients.get(partner.userId);

    if (requestSockId && partnerSockId) {
        const matchId = uuidv4(); 

        const matchSession: MatchSession = {
            matchId,
            users: {
                [req.userId]: {
                    userName: req.userName,
                    socketId: requestSockId,
                    hasAccepted: false,
                },
                [partner.userId]: {
                    userName: partner.userName,
                    socketId: partnerSockId,
                    hasAccepted: false,
                },
            },
            question: partner.question,
            language: partner.language,
        };

        activeMatches.set(matchId, matchSession);

        // notify users
        io.to(requestSockId).emit('matchFound', {
            matchId,
            partner: {
                userId: partner.userId,
                userName: partner.userName,
            },
            question: matchSession.question,
            language: matchSession.language,
        });

        io.to(partnerSockId).emit('matchFound', {
            matchId,
            partner: {
                userId: req.userId,
                userName: req.userName,
            },
            question: matchSession.question,
            language: matchSession.language,
        });

        logger.info(`Match partners sent to ${req.userId} and ${partner.userId}`);
    } else {
        logger.error(`Could not send match result to one or both users: ${req.userId}, ${partner.userId}`);
    }
};

export { sendMatchResult }
