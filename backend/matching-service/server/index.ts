import dotenv from 'dotenv'
import { Server } from 'socket.io'
import { sendMatchingRequest } from '../producer/producer'
import { startConsumer } from '../consumer/consumer'
import logger from '../utils/logger'

dotenv.config({ path: './.env' })

const connectedClients = new Map<string, string>()

const io = new Server({
    cors: {
        origin: '*',
    },
})

;(async () => {
    const { removeRequest } = await startConsumer(io, connectedClients)

    io.on('connection', (socket) => {
        logger.info(`New client connected: ${socket.id}`, { service: 'matching-service', timestamp: new Date().toISOString() })

        socket.on('login', (userId: string) => {
            connectedClients.set(userId, socket.id)
            logger.info(`User ${userId} logged in with socket ${socket.id}`, { service: 'matching-service', timestamp: new Date().toISOString() })
        })

        socket.on('requestMatch', async (data: any) => {
            const { userId, userName, difficulty, categories } = data
            logger.info(`User ${userId} has requested for a match with difficulty ${difficulty} and categories ${categories}`, { service: 'matching-service', timestamp: new Date().toISOString() })
            sendMatchingRequest(data)
        })

        socket.on('cancelMatch', (userId: string) => {
            removeRequest(userId)
            logger.info(`User ${userId} has canceled their match request`, { service: 'matching-service', timestamp: new Date().toISOString() })
            socket.emit('matchCanceled', { message: 'Your match request has been canceled.' })
        })

        socket.on('disconnect', () => {
            for (const [userId, id] of connectedClients.entries()) {
                if (id === socket.id) {
                    connectedClients.delete(userId)
                    logger.info(`User ${userId} disconnected`, { service: 'matching-service', timestamp: new Date().toISOString() })
                    break
                }
            }
            logger.info(`Client disconnected: ${socket.id}`, { service: 'matching-service', timestamp: new Date().toISOString() })
        })
    })

    const port = parseInt(process.env.PORT || '3000', 10)

    io.listen(port)
    logger.info(`Server started on port ${port}`, { service: 'matching-service', timestamp: new Date().toISOString() })
})()
