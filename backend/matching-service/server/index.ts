import dotenv from 'dotenv'
import { Server } from 'socket.io'
import { sendMatchingRequest } from '../producer/producer'
import { cancelMatchRequest, startConsumer } from '../consumer/consumer'
import logger from '../utils/logger'

dotenv.config({ path: './.env' })

const connectedClients = new Map<string, string>()

const io = new Server({
    cors: {
        origin: '*',
    },
})

io.on('connection', (socket) => {
    socket.on('login', (name) => {
        connectedClients.set(name, socket.id)
        logger.info(`User ${name} logged in with socket ${socket.id}`)
    })

    socket.on('requestMatch', async (data) => {
        const { name, difficulty, categories } = data
        logger.info(
            `User ${name} has requested for a match with difficulty ${difficulty} and categories ${categories}`,
        )
        sendMatchingRequest(data)
    })

    socket.on('disconnect', () => {
        for (const [name, id] of connectedClients.entries()) {
            if (id == socket.id) {
                connectedClients.delete(name)
                logger.info(`User ${name} disconnected`)
                break
            }
        }
    })

    socket.on('cancel', () => {
        let userName: string | undefined;
        for (const [name, id] of connectedClients.entries()) {
            if (id === socket.id) {
                userName = name
                break
            }
        }
        if (!userName) {
            logger.warn(`Cancel request received from unknown socket ${socket.id}`, { service: 'matching-service', timestamp: new Date().toISOString() })
            socket.emit('error', { message: 'User not found or not logged in.' })
            return
        }

        cancelMatchRequest(userName)
        socket.emit('cancelled', { message: 'Your match request has been cancelled.' })
        logger.info(`User ${userName} has cancelled their match request`, { service: 'matching-service', timestamp: new Date().toISOString() })
    })
})

const port = parseInt(process.env.PORT || '3000', 10)

io.listen(port)
logger.info(`Server started on port ${port}`)
startConsumer(io, connectedClients)
