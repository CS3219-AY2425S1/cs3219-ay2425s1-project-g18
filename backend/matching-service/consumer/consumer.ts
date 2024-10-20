import { connect, Connection } from 'amqplib'
import { Server } from 'socket.io'
import { performMatching } from './matching'
import { TimedMatchRequest } from '../models/types'
import logger from '../utils/logger'
import { sendMatchResult } from './sendMatchResults'

const requestQueue: TimedMatchRequest[] = []
const MATCH_TIMEOUT = 15000
let isMatching: boolean = false

const startConsumer = async (
    io: Server,
    connectedClients: Map<string, string>,
) => {
    let connection: Connection | null = null
    let channel: any = null

    // because sometimes, rabbitmq starts later than matching service, so we need to retry the connection.
    // rabbitmq usually takes around 10s to set up

    const maxRetries = 3
    const retryDelay = 13000 // 13 secs
    let rabbitPort: string = String(process.env.RABBITMQ_URL)

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            connection = await connect(
                rabbitPort,
            )
            channel = await connection.createChannel()
            const queue = 'matching_requests'
            await channel.assertQueue(queue, { durable: false })

            logger.info('Connected to RabbitMQ and waiting for matching requests...')
            break
        } catch (error: any) {
            logger.error(`Attempt ${attempt}: Failed to connect to RabbitMQ: ${error.message}`)
            if (attempt === maxRetries) {
                logger.error('Max retries reached. Exiting.')
                process.exit(1)
            }
            logger.info(`Retrying in ${retryDelay / 1000} seconds...`)
            await new Promise(res => setTimeout(res, retryDelay))
        }
    }

    channel.consume(
        'matching_requests',
        (msg: { content: { toString: () => string } }) => {
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
                )
                requestQueue.push(request)

                setTimeout(() => {
                    processMatching(request, io, connectedClients)
                }, MATCH_TIMEOUT)
            }
        },
        { noAck: true },
    )
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
            logger.info(`${req.userId} has already been matched and removed from the queue`)
            return
        }

        const currTime = Date.now()
        const activeRequests = requestQueue.filter(
            (r) => currTime - r.timestamp <= MATCH_TIMEOUT,
        )

        const matchPartner = await performMatching(req, activeRequests)
        
        if (reqIndex !== -1) {
            requestQueue.splice(reqIndex, 1)
            logger.info(`${req.userId} has been removed from the queue`)
        }

        if (matchPartner) {
            sendMatchResult(req, matchPartner, io, connectedClients)
            let partnerIndex = requestQueue.findIndex(
                (x) => x.userId === matchPartner.userId,
            )
            if (partnerIndex !== -1) {
                requestQueue.splice(partnerIndex, 1)
                logger.info(`${matchPartner.userId} has been removed from the queue`)
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
    } finally {
        isMatching = false
    }
}

const cancelMatchRequest = (name: string) => {
    const index = requestQueue.findIndex(req => req.userId === name)
    if (index !== -1) {
        requestQueue.splice(index, 1)
        logger.info(`Match request for ${name} has been cancelled and removed from the queue`)
    } else {
        logger.info(`No active match request found for ${name} to cancel`)
    }
}

export { startConsumer, cancelMatchRequest }
