import { connect, Connection, Channel } from 'amqplib'
import { Server } from 'socket.io'
import { performMatching } from './matching'
import { TimedMatchRequest, MatchPartner } from '../models/types'
import logger from '../utils/logger'
import { sendMatchResult } from './sendMatchResults'

const requestQueue: TimedMatchRequest[] = []
const MATCH_TIMEOUT = 300000 // 5 minutes
let isMatching: boolean = false

// track timeouts for each userId
const timeoutMap: Map<string, NodeJS.Timeout> = new Map()

const startConsumer = async (
    io: Server,
    connectedClients: Map<string, string>,
) => {
    let connection: Connection | null = null
    let channel: Channel | null = null

    const maxRetries = 3
    const retryDelay = 13000 // 13 seconds
    const rabbitUrl: string = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672'
    const queueName = 'matching_requests'

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            logger.info(`Attempt ${attempt}: Connecting to RabbitMQ at ${rabbitUrl}`, { service: 'matching-service', timestamp: new Date().toISOString() })
            connection = await connect(rabbitUrl)
            channel = await connection.createChannel()
            await channel.assertQueue(queueName, { durable: false })

            logger.info('Connected to RabbitMQ and waiting for matching requests...', { service: 'matching-service', timestamp: new Date().toISOString() })
            break
        } catch (error: any) {
            logger.error(`Attempt ${attempt}: Failed to connect to RabbitMQ: ${error.message}`, { service: 'matching-service', timestamp: new Date().toISOString() })
            if (attempt === maxRetries) {
                logger.error('Max retries reached. Exiting.', { service: 'matching-service', timestamp: new Date().toISOString() })
                process.exit(1)
            }
            logger.info(`Retrying in ${retryDelay / 1000} seconds...`, { service: 'matching-service', timestamp: new Date().toISOString() })
            await new Promise(res => setTimeout(res, retryDelay))
        }
    }

    if (!channel) {
        logger.error('Channel was not created. Exiting.', { service: 'matching-service', timestamp: new Date().toISOString() })
        process.exit(1)
    }

    channel.consume(
        queueName,
        (msg: any) => {
            if (msg) {
                const { userId, userName, difficulty, categories } = JSON.parse(
                    msg.content.toString(),
                )
                const request: TimedMatchRequest = {
                    userId,
                    userName,
                    difficulty,
                    categories,
                    timestamp: Date.now(),
                }
                logger.info(
                    `Received matching request: ${JSON.stringify(request)}`,
                    { service: 'matching-service', timestamp: new Date().toISOString() }
                )
                requestQueue.push(request)

                attemptImmediateMatch(request, io, connectedClients)

                if (!timeoutMap.has(userId)) {
                    const timeout = setTimeout(() => {
                        processMatching(request, io, connectedClients)
                    }, MATCH_TIMEOUT)
                    timeoutMap.set(userId, timeout)
                }
            }
        },
        { noAck: true },
    )

    const removeRequest = (userId: string) => {
        const index = requestQueue.findIndex((x) => x.userId === userId)
        if (index !== -1) {
            requestQueue.splice(index, 1)
            logger.info(`User ${userId} has been removed from the queue via cancellation`, { service: 'matching-service', timestamp: new Date().toISOString() })

            const timeout = timeoutMap.get(userId)
            if (timeout) {
                clearTimeout(timeout)
                timeoutMap.delete(userId)
                logger.info(`Cleared matchmaking timeout for user ${userId}`, { service: 'matching-service', timestamp: new Date().toISOString() })
            }
        } else {
            logger.info(`User ${userId} not found in the queue during cancellation`, { service: 'matching-service', timestamp: new Date().toISOString() })
        }
    }

    const attemptImmediateMatch = async (
        newRequest: TimedMatchRequest,
        io: Server,
        connectedClients: Map<string, string>,
    ) => {
        if (isMatching) {
            logger.info(`Currently matching. Skipping immediate match for user ${newRequest.userId}`)
            return
        }

        const activeRequests = requestQueue.filter(
            (r) => r.userId !== newRequest.userId && r.difficulty === newRequest.difficulty && r.categories.some(category => newRequest.categories.includes(category))
        )

        logger.info(`Attempting immediate match for user ${newRequest.userId}. Active requests: ${activeRequests.map(r => r.userId).join(', ')}`)

        if (activeRequests.length > 0) {
            const bestMatch = await performMatching(newRequest, activeRequests)

            if (bestMatch) {
                requestQueue.splice(requestQueue.findIndex(x => x.userId === newRequest.userId), 1)
                requestQueue.splice(requestQueue.findIndex(x => x.userId === bestMatch.userId), 1)
                logger.info(`Matched user ${newRequest.userId} with user ${bestMatch.userId}`, { service: 'matching-service', timestamp: new Date().toISOString() })

                // clear timeouts
                const timeout1 = timeoutMap.get(newRequest.userId)
                if (timeout1) {
                    clearTimeout(timeout1)
                    timeoutMap.delete(newRequest.userId)
                }

                const timeout2 = timeoutMap.get(bestMatch.userId)
                if (timeout2) {
                    clearTimeout(timeout2)
                    timeoutMap.delete(bestMatch.userId)
                }

                sendMatchResult(newRequest, bestMatch, io, connectedClients)
            }
        }
    }

    return { removeRequest }
}

const processMatching = async (
    req: TimedMatchRequest,
    io: Server,
    connectedClients: Map<string, string>,
) => {
    if (isMatching) {
        setTimeout(() => processMatching(req, io, connectedClients), 100)
        return
    }

    isMatching = true

    try {
        let reqIndex = requestQueue.findIndex((x) => x.userId === req.userId)

        if (reqIndex === -1) {
            logger.info(`${req.userId} has already been matched and removed from the queue`, { service: 'matching-service', timestamp: new Date().toISOString() })
            return
        }

        const currTime = Date.now()
        const activeRequests = requestQueue.filter(
            (r) => currTime - r.timestamp <= MATCH_TIMEOUT,
        )

        const matchPartner = await performMatching(req, activeRequests)
        
        if (reqIndex !== -1) {
            requestQueue.splice(reqIndex, 1)
            logger.info(`${req.userId} has been removed from the queue`, { service: 'matching-service', timestamp: new Date().toISOString() })

            const timeout = timeoutMap.get(req.userId)
            if (timeout) {
                clearTimeout(timeout)
                timeoutMap.delete(req.userId)
                logger.info(`Cleared matchmaking timeout for user ${req.userId}`, { service: 'matching-service', timestamp: new Date().toISOString() })
            }
        }

        if (matchPartner) {
            sendMatchResult(req, matchPartner, io, connectedClients)
            let partnerIndex = requestQueue.findIndex(
                (x) => x.userId === matchPartner.userId,
            )
            if (partnerIndex !== -1) {
                requestQueue.splice(partnerIndex, 1)
                logger.info(`${matchPartner.userId} has been removed from the queue`, { service: 'matching-service', timestamp: new Date().toISOString() })

                const partnerTimeout = timeoutMap.get(matchPartner.userId)
                if (partnerTimeout) {
                    clearTimeout(partnerTimeout)
                    timeoutMap.delete(matchPartner.userId)
                    logger.info(`Cleared matchmaking timeout for user ${matchPartner.userId}`, { service: 'matching-service', timestamp: new Date().toISOString() })
                }
            }
            return
        } else {
            const requestSockId = connectedClients.get(req.userId)

            if (requestSockId) {
                io.to(requestSockId).emit('noMatchFound', {
                    message: 'No suitable match found at this time',
                })
            }
        }
    } catch (error: any) {
        logger.error(`Error during matching process: ${error.message}`, { service: 'matching-service', timestamp: new Date().toISOString() })
    } finally {
        isMatching = false
    }
}

export { startConsumer }
