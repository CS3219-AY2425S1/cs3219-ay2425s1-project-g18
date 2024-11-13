import axios from 'axios'
import dotenv from 'dotenv'
import { Server } from 'socket.io'
import { createServer } from 'http'
import { connectToDatabase } from './db'
import { sendMatchingRequest } from '../producer/producer'
import { activeMatches, startConsumer } from '../consumer/consumer'
import logger from '../utils/logger'
import { parseBody, sendResponse, addMatch, updateMatch, getMatch, getMatchesWithUser } from '../utils/utils'

dotenv.config({ path: './.env' })

connectToDatabase()
const connectedClients = new Map<string, string>()

const httpServer = createServer(async (req, res) => {
    if (req.method == 'PATCH' && req.url == '/update-match') {
        try {
            const body = await parseBody(req)
            const { status, message } = await updateMatch(body)
            sendResponse(res, status, { message: message })
        } catch (e) {
            sendResponse(res, 500, { message: 'Error updating match' })
        }
    } else if (req.method == 'GET' && req.url?.startsWith('/get-user-match-history')) {
        try {
            const userId = req.url.split('/')[2]
            const { status, data, message } = await getMatchesWithUser(userId)

            if (status == 200) {
                sendResponse(res, status, { data })
            } else {
                sendResponse(res, status, { message })
            }
        } catch (e) {
            sendResponse(res, 500, { message: 'Error fetching past successful matches' })
        }
    } else if (req.method == 'GET' && req.url?.startsWith('/get-user-match')) {
        try {
            const matchId = req.url.split('/')[2]
            const { status, data, message } = await getMatch(matchId)
            
            if (status == 200) {
                sendResponse(res, status, { data })
            } else {
                sendResponse(res, status, { message })
            }
        } catch (e) {
            sendResponse(res, 500, { message: 'Error creating room' })
        }
    }
})

const io = new Server(httpServer, {
    cors:{
        origin: [
            process.env.FRONTEND_URL || 'http://localhost:3000',
            process.env.USER_SERVICE_URL || 'http://user_service:5000',
            process.env.QUESTION_SERVICE_URL || 'http://question_service:5001',
            process.env.MATCHING_SERVICE_URL || 'http://matching_service:5002',
            process.env.COLLAB_SERVICE_URL || 'http://collab_service:5003',
            process.env.CODE_EXECUTION_URL || 'http://code_execution_service:5005',
            process.env.HISTORY_SERVICE_URL || 'http://history_service:5006',
         ], 
        credentials: true, // allows cookies to be sent
    }
})

;(async () => {
    const { removeRequest } = await startConsumer(io, connectedClients)

    io.on('connection', (socket) => {
        logger.info(`New client connected: ${socket.id}`, {
            service: 'matching-service',
            timestamp: new Date().toISOString(),
        })

        socket.on('login', (userId: string) => {
            connectedClients.set(userId, socket.id)
            logger.info(`User ${userId} logged in with socket ${socket.id}`, {
                service: 'matching-service',
                timestamp: new Date().toISOString(),
            })
        })

        socket.on('requestMatch', async (data: any) => {
            const { userId, userName, difficulty, categories, language } = data
            logger.info(
                `User ${userId} has requested for a match with difficulty ${difficulty}, language ${language} and categories ${categories}`,
                {
                    service: 'matching-service',
                    timestamp: new Date().toISOString(),
                },
            )
            sendMatchingRequest(data)
        })

        socket.on('cancelMatch', (userId: string) => {
            removeRequest(userId)
            logger.info(`User ${userId} has canceled their match request`, {
                service: 'matching-service',
                timestamp: new Date().toISOString(),
            })
            socket.emit('matchCanceled', {
                message: 'Your match request has been canceled.',
            })
        })

        socket.on(
            'acceptMatch',
            async (data: { matchId: string; userId: string }) => {
                const { matchId, userId } = data
                const matchSession = activeMatches.get(matchId)

                logger.info(`User ${userId} has accepted match ${matchId}`)

                if (matchSession && matchSession.users[userId]) {
                    matchSession.users[userId].hasAccepted = true

                    const otherUserId = Object.keys(matchSession.users).find(
                        (id) => id !== userId,
                    )
                    const otherUser = matchSession.users[otherUserId!]

                    if (otherUser.hasAccepted) {
                        logger.info(
                            `Match partner: ${otherUser.userName} has also accepted match ${matchId}. Sending match accepted messages to both parties.`,
                        )

                        const res = await axios.post(
                            `${process.env.COLLAB_SERVICE_URL}/create-room`,
                            {
                                userId1: userId,
                                userId2: otherUserId,
                                language: matchSession.language,
                                question: matchSession.question,
                                matchId,
                            },
                        )

                        io.to(matchSession.users[userId].socketId).emit(
                            'matchAccepted',
                            {
                                matchId,
                                roomId: res.data.roomId,
                                language: res.data.language,
                            },
                        )
                        io.to(otherUser.socketId).emit('matchAccepted', {
                            matchId,
                            roomId: res.data.roomId,
                            language: res.data.language,
                        })

                        const payload = {
                            matchId,
                            collaborators: [userId, otherUserId],
                            questionId: matchSession.question.questionId,
                        }
                        await addMatch(payload)

                        activeMatches.delete(matchId)
                    } else {
                        logger.info(
                            `Match partner: ${otherUser.userName} has not accepted match ${matchId}. Sending wait message to user.`,
                        )
                        io.to(matchSession.users[userId].socketId).emit(
                            'waitingForPartner',
                            {
                                message:
                                    'Waiting for your partner to accept the match.',
                            },
                        )
                    }
                } else {
                    logger.info(`There is an error with match ${matchId}.`)
                    socket.emit('matchError', {
                        message: 'Invalid match or user.',
                    })
                }
            },
        )

        socket.on('disconnect', () => {
            for (const [userId, id] of connectedClients.entries()) {
                if (id === socket.id) {
                    connectedClients.delete(userId)
                    logger.info(`User ${userId} disconnected`, {
                        service: 'matching-service',
                        timestamp: new Date().toISOString(),
                    })
                    break
                }
            }

            activeMatches.forEach((matchSession, matchId) => {
                const userIds = Object.keys(matchSession.users)
                userIds.forEach((userId) => {
                    if (matchSession.users[userId].socketId === socket.id) {
                        const otherUserId = userIds.find((id) => id !== userId)
                        const otherUser = matchSession.users[otherUserId!]
                        io.to(otherUser.socketId).emit('matchCanceled', {
                            message: 'Your partner has disconnected.',
                        })
                        activeMatches.delete(matchId)
                    }
                })
            })

            logger.info(`Client disconnected: ${socket.id}`, {
                service: 'matching-service',
                timestamp: new Date().toISOString(),
            })
        })
    })

    const port = parseInt(process.env.PORT || '3000', 10)

    httpServer.listen(port)
    logger.info(`Server started on port ${port}`, {
        service: 'matching-service',
        timestamp: new Date().toISOString(),
    })
})()
