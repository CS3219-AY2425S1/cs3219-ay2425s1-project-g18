import axios from 'axios'
import dotenv from 'dotenv'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { sendMatchingRequest } from '../producer/producer'
import { activeMatches, startConsumer } from '../consumer/consumer'
import { router as createMatchRouter } from '../create-match/createMatchRoute'
import { router as updateMatchRouter } from '../update-match/updateMatchRoute'
import { connectToDatabase } from './db'
import logger from '../utils/logger'

dotenv.config({ path: './.env' })

const app = express()
const httpServer = createServer(app)
app.use(express.json())
app.use(createMatchRouter)
app.use(updateMatchRouter)

const connectedClients = new Map<string, string>()
connectToDatabase()

const io = new Server(httpServer, {
    cors: {
        origin: '*',
    },
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
            async (data: { matchId: string; userId: string, language: string }) => {
                const { matchId, userId, language } = data
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
                                language: language,
                            },
                        )

                        io.to(matchSession.users[userId].socketId).emit(
                            'matchAccepted',
                            { matchId, roomId: res.data.roomId, language: res.data.language },
                        )
                        io.to(otherUser.socketId).emit('matchAccepted', {
                            matchId,
                            roomId: res.data.roomId,
                            language: res.data.language
                        })

                        const createMatchRes = await axios.post(`http://localhost:${port}/add-match`, {
                            matchId,
                            collaborators: [userId, otherUserId],
                            questionId: matchSession.question.questionId,
                        },  {
                            validateStatus: (status) => status >= 200 && status < 500,
                        })

                        if (createMatchRes.status === 200) {
                            logger.info(`Match ${matchId} has been stored in the database.`)
                        } else {
                            logger.error(`Error storing match ${matchId} in the database.`)
                        }

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